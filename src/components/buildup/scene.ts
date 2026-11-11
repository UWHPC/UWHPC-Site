import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PALETTE, clay, outline } from "./materials";
import { buildBoard, buildCard, buildCasing } from "./models/gpu";
import { cardPose, slotPose, HERO_SLOT } from "./poses";
import { buildMicro } from "./models/micro";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { dieTextures } from "./textures";
import { cameraAt, progress } from "./timeline";

/**
 * The build-up hero's three.js scene. Models are built once; `update(p)`
 * is a pure function of scroll progress (via timeline.ts) plus `time` for
 * idle motion, so landing anywhere on the page renders the right frame.
 */

export type BuildupScene = {
  update: (p: number, time: number) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

export function createBuildupScene(canvas: HTMLCanvasElement, opts: { mobile: boolean }): BuildupScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x111111, 1);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.35;

  // clay lighting: one soft key, a cool rim, a broad fill
  const key = new THREE.DirectionalLight("#ffffff", 2.0);
  key.position.set(-0.6, 1, 0.8);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#c9d6ff", 0.7);
  rim.position.set(0.9, 0.5, -0.7);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight("#f2f2f5", "#1a1a1d", 1.1));

  const camera = new THREE.PerspectiveCamera(opts.mobile ? 48 : 34, 1, 0.05, 20000);

  /* ---- die: top face carries the floorplan and its power-on glow ------- */

  const textures: THREE.Texture[] = [];
  const tex = (c: HTMLCanvasElement, srgb = true) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    textures.push(t);
    return t;
  };
  const die = dieTextures();
  const dieProgress = { value: 0 };
  const dieTop = new THREE.MeshStandardMaterial({
    map: tex(die.base),
    emissiveMap: tex(die.glow),
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 1.5,
    roughness: 0.6,
    metalness: 0.05,
  });
  const timing = tex(die.timing, false);
  dieTop.onBeforeCompile = (shader) => {
    shader.uniforms.uTiming = { value: timing };
    shader.uniforms.uDieProgress = dieProgress;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uTiming;\nuniform float uDieProgress;")
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float tStart = texture2D(uTiming, vEmissiveMapUv).r;
        totalEmissiveRadiance *= smoothstep(tStart, tStart + 0.06, uDieProgress);`
      );
  };
  const silicon = clay(PALETTE.silicon, { roughness: 0.5 });
  // the hero card: board (with the die) now; casing parts join in Task 4
  const card = new THREE.Group();
  scene.add(card);
  const dieFaces = [silicon, silicon, dieTop, silicon, silicon, silicon];
  const board = buildBoard(dieFaces);
  card.add(board.group);
  const casing = buildCasing();
  const casingBase = casing.map(({ obj }) => obj.position.clone());
  casing.forEach(({ obj }) => card.add(obj));

  // the seven cards that join it, staggered outward from the hero's slot
  const others = [0, 1, 2, 4, 5, 6, 7]
    .sort((a, b) => Math.abs(a - HERO_SLOT) - Math.abs(b - HERO_SLOT))
    .map((slot, k) => {
      const g = buildCard(dieFaces);
      const pose = slotPose(slot);
      g.position.set(...pose.position);
      g.rotation.set(...pose.rotation);
      g.visible = false;
      scene.add(g);
      return { g, k, home: g.position.clone() };
    });

  // two 4-way NVLink bridges across the card tops (cards 0–3, 4–7)
  const bridgeMat = clay(PALETTE.deep);
  const bridgeEdge = clay(PALETTE.red, { roughness: 0.6 });
  const bridges = [0, 4].map((first) => {
    const x0 = slotPose(first).position[0] - 34;
    const x1 = slotPose(first + 3).position[0] + 5.5;
    const top = slotPose(first).position[1] + 55.5;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(x1 - x0, 7, 80, 3, 2), bridgeMat);
    g.add(body);
    outline(body, 0.25);
    const edge = new THREE.Mesh(new RoundedBoxGeometry(x1 - x0 - 6, 1, 1.2, 2, 0.4), bridgeEdge);
    edge.position.set(0, 3.6, 40);
    g.add(edge);
    const home = new THREE.Vector3((x0 + x1) / 2, top + 3.5, 54);
    g.position.copy(home);
    g.visible = false;
    scene.add(g);
    return { g, home };
  });

  const micro = buildMicro();
  scene.add(micro.group);

  /* ---- per frame ------------------------------------------------------- */

  function update(p: number, time: number) {
    void time;
    micro.setLit(progress(p, "transistors"));
    const toDie = progress(p, "toDie");
    micro.setOpacity(1 - Math.min(1, Math.max(0, (toDie - 0.4) / 0.6)));
    dieProgress.value = toDie;

    // casing parts fly in, one after another
    const c = progress(p, "casing");
    casing.forEach(({ obj, from, order }, i) => {
      const raw = Math.min(1, Math.max(0, (c - order * 0.14) / 0.44));
      const t = raw * raw * (3 - 2 * raw);
      obj.position.set(
        casingBase[i].x + from[0] * (1 - t),
        casingBase[i].y + from[1] * (1 - t),
        casingBase[i].z + from[2] * (1 - t)
      );
      obj.visible = t > 0;
    });

    // the hero card turns upright into its slot while the others arrive
    const pose = cardPose(p);
    card.position.set(...pose.position);
    card.rotation.set(...pose.rotation);
    const j = progress(p, "join");
    others.forEach(({ g, k, home }) => {
      const raw = Math.min(1, Math.max(0, (j - 0.3 - k * 0.08) / 0.3));
      const t = raw * raw * (3 - 2 * raw);
      g.position.set(home.x, home.y + 260 * (1 - t), home.z - 60 * (1 - t));
      g.visible = t > 0;
    });
    const br = progress(p, "bridges");
    bridges.forEach(({ g, home }, i) => {
      const raw = Math.min(1, Math.max(0, (br - i * 0.3) / 0.7));
      const t = raw * raw * (3 - 2 * raw);
      g.position.set(home.x, home.y + 140 * (1 - t), home.z);
      g.visible = t > 0;
    });

    const { position, target } = cameraAt(p);
    camera.position.set(...position);
    camera.lookAt(...target);
    const d = Math.hypot(position[0] - target[0], position[1] - target[1], position[2] - target[2]);
    camera.near = Math.max(0.05, d / 60);
    camera.far = d * 40 + 2000;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function resize(w: number, h: number) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function dispose() {
    renderer.dispose();
    pmrem.dispose();
    env.dispose();
    textures.forEach((t) => t.dispose());
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
  }

  return { update, resize, dispose };
}
