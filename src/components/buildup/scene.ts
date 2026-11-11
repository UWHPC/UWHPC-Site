import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PALETTE, clay } from "./materials";
import { buildBoard } from "./models/gpu";
import { buildMicro } from "./models/micro";
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
  const board = buildBoard([silicon, silicon, dieTop, silicon, silicon, silicon]);
  card.add(board.group);

  const micro = buildMicro();
  scene.add(micro.group);

  /* ---- per frame ------------------------------------------------------- */

  function update(p: number, time: number) {
    void time;
    micro.setLit(progress(p, "transistors"));
    const toDie = progress(p, "toDie");
    micro.setOpacity(1 - Math.min(1, Math.max(0, (toDie - 0.4) / 0.6)));
    dieProgress.value = toDie;

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
