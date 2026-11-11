import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { PALETTE, clay, detail, outline } from "./materials";
import { buildBoard, buildCard, buildCasing } from "./models/gpu";
import { cardPose, joinDrop, slotPose, HERO_SLOT, SERVER_FLOOR_Y } from "./poses";
import { buildServer, type ServerGroup } from "./models/server";
import { buildMicro, dieRailGeometry, MICRO_PULSE_SPAN } from "./models/micro";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { DIE_WIDTH, dieTextures, shadowTexture } from "./textures";
import { STEPS, cameraAt, endDrift, progress, serverBootAt, xrayAt } from "./timeline";
import { renderQuality, seat } from "./motion";
import { buildAtmosphere } from "./atmosphere";

/**
 * The build-up hero's three.js scene. Models are built once; `update(p)`
 * is a pure function of scroll progress (via timeline.ts) plus `time` for
 * idle motion, so landing anywhere on the page renders the right frame.
 */

export type BuildupScene = {
  update: (p: number, time: number) => void;
  /** Phones render at lower resolution while moving; call each frame. */
  setMoving: (moving: boolean) => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

export function createBuildupScene(canvas: HTMLCanvasElement, opts: { mobile: boolean }): BuildupScene {
  // phones build the many small rounded parts with fewer segments
  detail.segments = opts.mobile ? 1 : 3;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.setClearColor(0x111111, 1);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04);
  room.dispose();
  scene.environment = env.texture;
  scene.environmentIntensity = 0.35;

  // clay lighting: one soft key, two cool rims from behind that pick the
  // dark sides of the cards and chassis out of the background, a broad fill
  const key = new THREE.DirectionalLight("#ffffff", 2.0);
  key.position.set(-0.6, 1, 0.8);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#c9d6ff", 1.5);
  rim.position.set(0.9, 0.5, -0.7);
  scene.add(rim);
  const rim2 = new THREE.DirectionalLight("#d6dcf0", 0.9);
  rim2.position.set(-1, 0.35, -0.6);
  scene.add(rim2);
  scene.add(new THREE.HemisphereLight("#f2f2f5", "#1a1a1d", 1.1));
  // the ending's light sweep: a soft cool light that passes once across the
  // interior of the server as the lid clears
  const sweep = new THREE.PointLight("#dfe6ff", 0, 540, 0);
  scene.add(sweep);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 20000);
  let width = 1;
  let height = 1;
  let moving = false;
  // lens and resolution from the current size, so turning a phone re-frames
  const applyQuality = () => {
    const q = renderQuality(width, window.devicePixelRatio || 1, moving);
    if (renderer.getPixelRatio() !== q.pixelRatio) {
      renderer.setPixelRatio(q.pixelRatio);
      renderer.setSize(width, height, false);
    }
    camera.fov = q.fov;
  };

  /* ---- die: top face carries the floorplan and its power-on glow ------- */

  const textures: THREE.Texture[] = [];
  const tex = (c: HTMLCanvasElement, srgb = true) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(opts.mobile ? 8 : 16, renderer.capabilities.getMaxAnisotropy());
    textures.push(t);
    return t;
  };
  const die = dieTextures(opts.mobile ? 1024 : 2048);
  const dieProgress = { value: 0 };
  const pulseFront = { value: 0 };
  const pulseSpan = { value: MICRO_PULSE_SPAN };
  const pulseStrength = { value: 0 };
  const pulseUniforms = { uPulseFront: pulseFront, uPulseSpan: pulseSpan, uPulseStrength: pulseStrength };
  const pulseShader = `
    uniform float uPulseFront;
    uniform float uPulseSpan;
    uniform float uPulseStrength;
    float powerPulse(float distance) {
      float delta = 0.5 + distance / uPulseSpan - uPulseFront;
      return exp(-delta * delta / 0.008) * uPulseStrength;
    }`;
  const dieTop = new THREE.MeshPhysicalMaterial({
    map: tex(die.base),
    emissiveMap: tex(die.glow),
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 1.5,
    roughness: 0.38,
    metalness: 0.19,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
  });
  const timing = tex(die.timing, false);
  dieTop.onBeforeCompile = (shader) => {
    shader.uniforms.uTiming = { value: timing };
    shader.uniforms.uDieProgress = dieProgress;
    Object.assign(shader.uniforms, pulseUniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
        uniform sampler2D uTiming;
        uniform float uDieProgress;
        ${pulseShader}`)
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float tStart = texture2D(uTiming, vEmissiveMapUv).r;
        float powered = smoothstep(tStart, tStart + 0.06, uDieProgress);
        float diagonal = (vEmissiveMapUv.x - vEmissiveMapUv.y) * ${DIE_WIDTH.toFixed(1)};
        totalEmissiveRadiance *= mix(powered * 0.84, 1.0, powerPulse(diagonal));`
      );
  };
  const silicon = clay(PALETTE.silicon, { roughness: 0.5 });
  // the hero card: board (with the die) now; casing parts join in Task 4
  const card = new THREE.Group();
  scene.add(card);
  const dieFaces = [silicon, silicon, dieTop, silicon, silicon, silicon];
  const board = buildBoard(dieFaces);
  card.add(board.group);
  const railMaterial = new THREE.MeshStandardMaterial({ color: "#907553", metalness: 0.43, roughness: 0.55 });
  railMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, pulseUniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vRailDiagonal;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRailDiagonal = position.x + position.z;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nvarying float vRailDiagonal;\n${pulseShader}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        totalEmissiveRadiance += vec3(0.8, 0.045, 0.035) * powerPulse(vRailDiagonal);`);
  };
  board.group.add(new THREE.Mesh(dieRailGeometry(), railMaterial));
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
  const shadowMap = tex(shadowTexture());
  const footShadowGeo = new THREE.PlaneGeometry(30, 48).rotateX(-Math.PI / 2);
  const bridgeMat = clay(PALETTE.deep);
  const bridgeCover = clay("#42464f", { roughness: 0.53 });
  const bridgeMetal = new THREE.MeshStandardMaterial({ color: "#727883", metalness: 0.46, roughness: 0.44 });
  const bridgeFastener = new THREE.CylinderGeometry(2.25, 2.55, 0.8, 12);
  const connectorMark = new THREE.BoxGeometry(6.5, 0.6, 1.6);
  const connectorHousing = new RoundedBoxGeometry(13, 4.2, 29, 2, 0.85);
  const connectorGasket = new RoundedBoxGeometry(14.4, 0.8, 30.5, 1, 0.32);
  const gasketMat = clay("#101115", { roughness: 0.92 });
  const bridgeStandoff = 3.8;
  const bridgeEdge = clay(PALETTE.red, { roughness: 0.6 });
  bridgeEdge.emissive.set(PALETTE.red);
  bridgeEdge.emissiveIntensity = 0;
  const bridges = [0, 4].map((first) => {
    const x0 = slotPose(first).position[0] - 34;
    const x1 = slotPose(first + 3).position[0] + 5.5;
    const top = slotPose(first).position[1] + 55.5;
    const g = new THREE.Group();
    const footShadowMat = new THREE.MeshBasicMaterial({
      map: shadowMap, transparent: true, opacity: 0, depthWrite: false, toneMapped: false,
    });
    const footShadows = new THREE.InstancedMesh(footShadowGeo, footShadowMat, 4);
    const shadowMatrix = new THREE.Matrix4();
    g.add(footShadows);
    const width = x1 - x0;
    const body = new THREE.Mesh(new RoundedBoxGeometry(width, 7, 80, 3, 2), bridgeMat);
    g.add(body);
    outline(body, 0.25);
    const cover = new THREE.Mesh(new RoundedBoxGeometry(width - 10, 1.5, 59, 2, 0.65), bridgeCover);
    cover.position.y = 4.05;
    g.add(cover);
    const ridge = new THREE.Mesh(new RoundedBoxGeometry(width - 26, 0.9, 3, 2, 0.35), bridgeMetal);
    ridge.position.set(0, 4.95, -19);
    g.add(ridge);
    for (const x of [-width / 2 + 10, width / 2 - 10]) {
      for (const z of [-23, 23]) {
        const fastener = new THREE.Mesh(bridgeFastener, bridgeMetal);
        fastener.position.set(x, 5.05, z);
        g.add(fastener);
      }
    }
    for (let i = 0; i < 4; i++) {
      // The upright shroud's upper edge sits about 24 mm inboard of the PCB.
      const x = slotPose(first + i).position[0] - (x0 + x1) / 2 - 23.7;
      const mark = new THREE.Mesh(connectorMark, bridgeEdge);
      mark.position.set(x, 4.95, 22);
      const housing = new THREE.Mesh(connectorHousing, bridgeCover);
      housing.position.set(x, -5.45, 11);
      const gasket = new THREE.Mesh(connectorGasket, gasketMat);
      gasket.position.set(x, -7.1, 11);
      g.add(mark, housing, gasket);
      footShadows.setMatrixAt(i, shadowMatrix.makeTranslation(x, -6.64, 11));
    }
    const edge = new THREE.Mesh(new RoundedBoxGeometry(width - 6, 1, 1.2, 2, 0.4), bridgeEdge);
    edge.position.set(0, 3.6, 40);
    g.add(edge);
    const home = new THREE.Vector3((x0 + x1) / 2, top + 3.5 + bridgeStandoff, 54);
    g.position.copy(home);
    g.visible = false;
    scene.add(g);
    return { g, home, footShadows };
  });

  // contact shadows: soft dark pools under the lying card and the server
  const shadow = (w: number, d: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, toneMapped: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = -1;
    scene.add(m);
    return m;
  };
  const cardShadow = shadow(170, 360);
  cardShadow.position.set(0, -9.5, -18);
  const serverShadow = shadow(700, 1150);
  serverShadow.position.set(0, SERVER_FLOOR_Y - 3, 0);
  const cardShadowMat = cardShadow.material as THREE.MeshBasicMaterial;
  const serverShadowMat = serverShadow.material as THREE.MeshBasicMaterial;
  const atmosphere = buildAtmosphere(scene, sweep.position, opts.mobile);

  const micro = buildMicro();
  scene.add(micro.group);

  /* ---- the server that builds around the cards ------------------------- */

  const server = buildServer();
  const serverGroups = Object.entries(server.parts) as [ServerGroup, { obj: THREE.Object3D; from: [number, number, number] }[]][];
  const serverBase = new Map<THREE.Object3D, THREE.Vector3>();
  serverGroups.forEach(([, list]) =>
    list.forEach(({ obj }) => {
      serverBase.set(obj, obj.position.clone());
      obj.visible = false;
      scene.add(obj);
    })
  );
  const panelMaterials = (meshes: THREE.Mesh[]) => new Set(meshes.map((m) => m.material as THREE.MeshStandardMaterial));
  const shellMats = panelMaterials(server.shell);
  const lidMats = panelMaterials(server.lidShell);
  const frameMats = panelMaterials(server.frameShell);
  const ledBase = server.leds.map((m) => m.color.clone());
  const latchHome = server.lidLatch.position.z;
  let lastFrameTime = 0;

  /* ---- per frame ------------------------------------------------------- */

  function update(p: number, time: number) {
    const toDie = progress(p, "toDie");
    const detailOpacity = 1 - THREE.MathUtils.smoothstep(toDie, 0.38, 0.59);
    const front = ((time * 0.5) % 1.5) - 0.25;
    micro.setOpacity(detailOpacity);
    if (micro.group.visible) micro.setLit(progress(p, "transistors"), front);
    dieProgress.value = toDie;
    pulseFront.value = front;
    pulseSpan.value = THREE.MathUtils.lerp(MICRO_PULSE_SPAN, DIE_WIDTH * 1.3, THREE.MathUtils.smoothstep(toDie, 0.23, 0.8));
    pulseStrength.value = THREE.MathUtils.smoothstep(toDie, 0.07, 0.33) * (1 - THREE.MathUtils.smoothstep(toDie, 0.74, 1));

    // casing parts fly in, one after another
    const c = progress(p, "casing");
    casing.forEach(({ obj, from, order }, i) => {
      const t = seat((c - order * 0.14) / 0.44);
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
    const board = progress(p, "toBoard");
    const cardStage = Math.min(board * 2, 1) * (1 - Math.min(1, j / 0.4));
    const serverStage = Math.min(1, j / 0.5);
    cardShadowMat.opacity = cardStage;
    cardShadow.visible = cardShadowMat.opacity > 0.01;
    serverShadowMat.opacity = serverStage;
    serverShadow.visible = serverShadowMat.opacity > 0.01;
    rim.intensity = 1.5 + 0.45 * cardStage + 0.28 * serverStage;
    others.forEach(({ g, k, home }) => {
      const t = joinDrop(j, k);
      g.position.set(home.x, home.y + 260 * (1 - t), home.z - 60 * (1 - t));
      g.visible = t > 0;
    });
    const br = progress(p, "bridges");
    bridges.forEach(({ g, home, footShadows }, i) => {
      const t = seat((br - i * 0.3) / 0.7);
      g.position.set(home.x, home.y + 140 * (1 - t), home.z);
      g.visible = t > 0;
      footShadows.visible = Math.abs(t - 1) < 0.007;
      footShadows.material.opacity = 0.62 * (1 - THREE.MathUtils.smoothstep(Math.abs(t - 1), 0, 0.007));
    });

    serverGroups.forEach(([key, list]) => {
      const g = progress(p, key);
      list.forEach(({ obj, from }, i) => {
        // within a group, parts arrive one after another
        const t = seat((g - (i / list.length) * 0.5) / 0.5);
        const base = serverBase.get(obj)!;
        obj.position.set(base.x + from[0] * (1 - t), base.y + from[1] * (1 - t), base.z + from[2] * (1 - t));
        obj.visible = t > 0;
      });
    });
    const boot = serverBootAt(p);
    server.lidLatch.position.z = latchHome - 4.3 * (1 - boot.latch);
    const dt = THREE.MathUtils.clamp(time - lastFrameTime, 0, 0.05);
    lastFrameTime = time;
    server.rotors.forEach((rotor, i) => {
      // Integrate speed so scrubbing the boot never snaps the blades to a new angle.
      rotor.rotation.z = (rotor.rotation.z - dt * boot.fanSpeed * (10.2 + (i % 3) * 0.65)) % (2 * Math.PI);
    });
    server.leds.forEach((m, i) => {
      const activity = 0.5 + 0.25 * Math.sin(time * (4.1 + i * 1.3) + i * 2.1) + 0.25 * Math.sin(time * (1.7 + i * 0.45));
      const power = i === 8 ? boot.power : i < 4 ? boot.firstBank : boot.secondBank;
      const flicker = i === 8 ? 1 : 1 - boot.activity * 0.5 * activity;
      m.color.copy(ledBase[i]).multiplyScalar(THREE.MathUtils.lerp(0.05, flicker, power));
    });

    // the closed server turns see-through so the eight GPUs stay in view
    const xr = xrayAt(p);
    for (const [materials, opacity] of [[shellMats, xr.shell], [lidMats, xr.lid], [frameMats, xr.frame]] as const) {
      for (const material of materials) {
        material.opacity = opacity;
      }
    }
    server.shellEdges.opacity = xr.edges;
    bridgeEdge.emissiveIntensity = 0.16 * THREE.MathUtils.smoothstep(p, STEPS.bridges[1], STEPS.bridges[1] + 0.018) + 0.49 * boot.secondBank;

    // the keys are framed for landscape; a tall, narrow screen stands back
    const { position, target } = cameraAt(p);
    const portraitFit = camera.aspect < 1 ? Math.min(2.35, 0.62 / camera.aspect + 0.3) : 1;
    // The angled chassis is widest on screen just before the camera swings front-on.
    const narrow = 1 - THREE.MathUtils.smoothstep(camera.aspect, 0.5, 0.78);
    const wideChassis = THREE.MathUtils.smoothstep(p, STEPS.chassis[0], STEPS.lid[1]) *
      (1 - THREE.MathUtils.smoothstep(p, STEPS.xray[0], STEPS.xray[1]));
    const finaleFrame = THREE.MathUtils.smoothstep(camera.aspect, 1.05, 1.5) * progress(p, "xray");
    const fit = portraitFit * (1 + 0.16 * narrow * wideChassis + 0.16 * finaleFrame);
    const framingY = target[1] + 44 * finaleFrame;
    // at the end, a slow sway around the server
    const yaw = endDrift(p, time);
    const ox = (position[0] - target[0]) * fit;
    const oz = (position[2] - target[2]) * fit;
    camera.position.set(
      target[0] + ox * Math.cos(yaw) + oz * Math.sin(yaw),
      framingY + (position[1] - target[1]) * fit,
      target[2] - ox * Math.sin(yaw) + oz * Math.cos(yaw)
    );

    const sw = THREE.MathUtils.smoothstep(p, STEPS.xray[0] + 0.015, STEPS.xray[1] + 0.006);
    const sweepStrength = Math.sin(Math.PI * sw);
    sweep.intensity = 1.65 * sweepStrength;
    sweep.position.set(-410 + 820 * sw, SERVER_FLOOR_Y + 285, 305);
    atmosphere.update(cardStage, serverStage, sweepStrength, time, renderer.getPixelRatio());
    camera.lookAt(target[0], framingY, target[2]);
    const d = camera.position.distanceTo(new THREE.Vector3(target[0], framingY, target[2]));
    camera.near = Math.max(0.05, d / 60);
    camera.far = d * 40 + 2000;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  function resize(w: number, h: number) {
    width = w;
    height = h;
    renderer.setSize(w, h, false);
    applyQuality();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function setMoving(m: boolean) {
    if (m === moving) return;
    moving = m;
    applyQuality();
  }

  function dispose() {
    renderer.dispose();
    pmrem.dispose();
    env.dispose();
    atmosphere.dispose();
    dieTop.dispose();
    railMaterial.dispose();
    textures.forEach((t) => t.dispose());
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
    });
  }

  return { update, setMoving, resize, dispose };
}
