# GPU Build-up Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home-page hero with a scroll-driven 3D story in a clay style: transistors → die → bare GPU board, then the server is built around that GPU and ends closed in an x-ray view with all 8 GPUs visible.

**Architecture:** All timing and camera maths live in one pure, unit-tested module (`timeline.ts`) that maps scroll progress `p ∈ [0,1]` to step progress, camera pose, readout level and overlay opacity. A three.js scene (dynamically imported after first paint) builds the models once and, each frame, only reads `timeline.ts` and moves/fades parts. A hook owns scroll damping, overlays and the render loop.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind 4, TypeScript, three.js `0.186.0` (+ `@types/three@0.186.0`), `bun test` for unit tests.

**Spec:** `docs/superpowers/specs/2026-11-11-gpu-buildup-hero-design.md`

## Global Constraints

- Branch: `redesign/gpu-buildup-hero`.
- Style: clay / product render — matte charcoal, soft light, rounded edges, red `#cd393c` used sparingly; faint light edge outlines; page background `#111111`, silver `#c8c8c8`.
- No vendor branding or logos on any model; no image or model files (procedural geometry, canvas textures).
- three.js loaded by dynamic import after first paint; headline visible before it loads; works with no WebGL.
- Ignore `prefers-reduced-motion` (animations always on).
- Render only while the hero is on screen.
- Hero runway: `300vh` (`SCROLL_VH = 300`).
- After the bare board (p ≥ 0.36) the camera must not fly: target moves < 250 mm total, distance stays within ×4.
- Overlays keep their roles: kicker + "High / Performance / Computing" on load; "UWHPC" title + tagline + CTAs "Get Involved" → `/join`, "Learn More" → `#about` at the end; scale readout + callouts; "Skip intro ↓" → `#about`.
- Readout copy (exact):
  - Transistor — "TSMC 4N · 80 billion per die"
  - Die — "GH100 · 144 SMs, full die"
  - GPU — "H200 · 141 GB HBM3e" — callout "Maverick works here: irregular graph workloads on one GPU."
  - Server — "8 GPUs over NVLink" — callout "BATS starts here: beamforming split across GPUs."
- Gates for every task: `npx tsc --noEmit -p .`, `bun run lint`, `bun test`, `bun run build` all pass.

## Review Focus

1. Overscroll / iOS bounce gives p < 0 or p > 1 — the scene and camera must clamp, never jump or NaN.
2. Landing mid-page (reload restores scroll, or "Skip intro"/"Learn More" jumps) — the frame must be correct for that p immediately: every update is a pure function of p, no accumulated state.
3. No WebGL / three.js import fails — headline, title and CTAs still appear and work; `data-scene-ready="failed"`.
4. Window resize or phone rotation mid-scroll — canvas and camera aspect follow; no stretched frame.
5. Low-power phones — pixel ratio capped, no horizontal scroll at 375 px, the readout stays legible.

Tests pinning 1, 2 and 3's overlay half live in Task 1; 3's scene half, 4 and 5 are verification steps in Tasks 2 and 6.

---

## File structure

| File | Responsibility |
|---|---|
| `src/components/buildup/timeline.ts` | Pure maths: step ranges, eased progress, camera keys + interpolation, readout level, overlay opacities. No three.js import. |
| `src/components/buildup/timeline.test.ts` | `bun test` unit tests for the above. |
| `src/components/buildup/materials.ts` | Clay palette and `outline(mesh)` helper (edge lines). |
| `src/components/buildup/textures.ts` | Canvas textures: die floorplan (base, glow, timing), PCB. |
| `src/components/buildup/models/micro.ts` | Transistor patch and standard-cell rows on the die surface. |
| `src/components/buildup/models/gpu.ts` | Package + bare board, and the card's casing parts (redesigned shroud). |
| `src/components/buildup/models/server.ts` | Server parts: switch board, motherboard/CPUs/DIMMs, fans, PSUs, chassis, lid, NVLink bridges. |
| `src/components/buildup/scene.ts` | `createBuildupScene()`: renderer, lights, assembles models, `update(p, t)` applies timeline. |
| `src/hooks/useBuildupScroll.ts` | Scroll → damped p, overlays, lazy scene import, visibility-gated rAF loop. |
| `src/components/Hero.tsx` | Markup: canvas, overlays, readout. |
| `src/app/globals.css` | Hero overlay styles; remove the old chip-hero rules. |

Old `src/components/ChipDie.tsx` and `src/hooks/useScrollProgress.ts` become unused; leave them in place for the team to delete.

## Shared geometry (decided here so every task agrees)

- Units: millimetres. World origin = centre of the **die top surface** of the hero card in its *solo* pose.
- Solo card pose (p < 0.48): card lying flat, PCB horizontal, components up, long axis along world z, die at origin.
- Upright card pose (final): card standing in its slot, components facing −x, PCIe edge down, long axis along z. Card size 267 (z) × 111 (height) × 40 (thick).
- Server (4U): 448 (x) × 176 (y) × 800 (z), floor at `y = SERVER_FLOOR_Y = -140`, centred so the hero card's slot is index 3 of 8 (`CARD_PITCH = 44`, slot x = `-154 + i*44`), cards' centre z = 60.

---

### Task 1: Timeline module (pure, tested)

**Files:**
- Create: `src/components/buildup/timeline.ts`
- Create: `src/components/buildup/timeline.test.ts`
- Modify: `package.json` (add `"test": "bun test"`)

**Interfaces:**
- Produces:
  - `export type Step = "transistors" | "toDie" | "toBoard" | "casing" | "join" | "bridges" | "switchboard" | "motherboard" | "fans" | "psus" | "chassis" | "lid" | "xray" | "title"`
  - `export const STEPS: Record<Step, [number, number]>` with exactly:
    `transistors [0,0.10]`, `toDie [0.10,0.26]`, `toBoard [0.26,0.36]`, `casing [0.36,0.48]`, `join [0.48,0.58]`, `bridges [0.57,0.62]`, `switchboard [0.60,0.65]`, `motherboard [0.64,0.71]`, `fans [0.70,0.74]`, `psus [0.72,0.76]`, `chassis [0.75,0.81]`, `lid [0.80,0.85]`, `xray [0.85,0.90]`, `title [0.90,0.97]`
  - `export const SCROLL_VH = 300`
  - `export function clampP(p: number): number`
  - `export function progress(p: number, step: Step): number` — eased (smootherstep) 0→1 across the step's range, clamped.
  - `export type Vec3 = [number, number, number]`
  - `export type CameraKey = { t: number; target: Vec3; offset: Vec3 }`
  - `export const CAMERA_KEYS: CameraKey[]` (values below)
  - `export function cameraAt(p: number): { position: Vec3; target: Vec3 }` — between neighbouring keys: ease-in-out-sine in t; distance interpolated geometrically (log-linear); target lerped by zoom fraction `(d−da)/(db−da)` (or by eased t when |db−da| < 5% of da); direction = normalised lerp of normalised offsets.
  - `export type Level = { name: string; note: string; from: number; callout: string }`
  - `export const LEVELS: Level[]` — four entries, `from` = 0, 0.12, 0.30, 0.50, copy from Global Constraints (Transistor and Die callouts are `""`).
  - `export function levelAt(p: number): number`
  - `export function overlaysAt(p: number): { intro: number; cue: number; hud: number; title: number; endcap: number }` — intro fades out over p 0.01–0.06; cue over 0.02–0.05; hud fades in 0.04–0.08 and out 0.86–0.89; title = `progress(p,"title")`; endcap eased over 0.92–0.98.

Camera keys (target, offset in mm):

| t | target | offset |
|---|---|---|
| 0.00 | [0,0,0] | [1.6, 2.4, 2.0] |
| 0.10 | [0,0,0] | [2.4, 3.6, 2.6] |
| 0.26 | [0,0,0] | [28, 40, 34] |
| 0.36 | [0,-4,10] | [170, 210, 200] |
| 0.48 | [0,10,0] | [250, 230, 300] |
| 0.60 | [0,-40,40] | [420, 360, 520] |
| 0.85 | [0,-60,40] | [620, 500, 760] |
| 1.00 | [0,-60,40] | [580, 440, 820] |

- [ ] **Step 1: Write the failing tests** in `timeline.test.ts` (import from `bun:test`):

```ts
test("progress clamps and is stateless", () => {
  expect(progress(-0.2, "transistors")).toBe(0);
  expect(progress(1.3, "title")).toBe(1);
  const a = progress(0.42, "casing");
  progress(0.9, "casing");
  expect(progress(0.42, "casing")).toBe(a);
});
test("camera hits every key exactly", () => {
  for (const k of CAMERA_KEYS) {
    const { position, target } = cameraAt(k.t);
    k.target.forEach((v, i) => expect(target[i]).toBeCloseTo(v, 4));
    k.offset.forEach((v, i) => expect(position[i] - target[i]).toBeCloseTo(v, 3));
  }
});
test("camera clamps outside [0,1]", () => {
  expect(cameraAt(-0.5)).toEqual(cameraAt(0));
  expect(cameraAt(1.5)).toEqual(cameraAt(1));
});
test("camera never flies after the bare board", () => {
  const ds: number[] = []; let travel = 0; let prev = cameraAt(0.36).target;
  for (let p = 0.36; p <= 1; p += 0.005) {
    const { position, target } = cameraAt(p);
    ds.push(Math.hypot(...position.map((v, i) => v - target[i])));
    travel += Math.hypot(...target.map((v, i) => v - prev[i])); prev = target;
  }
  expect(Math.max(...ds) / Math.min(...ds)).toBeLessThan(4);
  expect(travel).toBeLessThan(250);
});
test("camera is continuous (no jumps)", () => {
  for (let p = 0; p < 1; p += 0.001) {
    const a = cameraAt(p).position, b = cameraAt(p + 0.001).position;
    const d = Math.hypot(...a.map((v, i) => v - b[i]));
    expect(d).toBeLessThan(Math.hypot(...a) * 0.08 + 1);
  }
});
test("levels and copy", () => {
  expect(LEVELS.map((l) => l.name)).toEqual(["Transistor", "Die", "GPU", "Server"]);
  expect(LEVELS[0].note).toBe("TSMC 4N · 80 billion per die");
  expect(LEVELS[1].note).toBe("GH100 · 144 SMs, full die");
  expect(levelAt(0)).toBe(0); expect(levelAt(0.2)).toBe(1);
  expect(levelAt(0.35)).toBe(2); expect(levelAt(0.95)).toBe(3); expect(levelAt(-1)).toBe(0);
});
test("overlays: content is visible at both ends", () => {
  expect(overlaysAt(0).intro).toBe(1);
  expect(overlaysAt(1).title).toBe(1);
  expect(overlaysAt(1).endcap).toBe(1);
  expect(overlaysAt(1).hud).toBe(0);
});
```

- [ ] **Step 2: Run `bun test src/components/buildup/timeline.test.ts`** — expected FAIL (module not found).
- [ ] **Step 3: Implement `timeline.ts`** with the exports above.
- [ ] **Step 4: Run `bun test`** — expected all PASS. Add `"test": "bun test"` to `package.json` scripts.
- [ ] **Step 5: Commit**

```bash
git add package.json src/components/buildup/timeline.ts src/components/buildup/timeline.test.ts
git commit -m "Add build-up hero timeline with tests"
```

---

### Task 2: Scene shell, hook and hero overlays (transistor stage visible)

**Files:**
- Modify: `package.json`, `bun.lock` (add `three@0.186.0`, dev `@types/three@0.186.0`)
- Create: `src/components/buildup/materials.ts`, `src/components/buildup/textures.ts`, `src/components/buildup/models/micro.ts`, `src/components/buildup/scene.ts`, `src/hooks/useBuildupScroll.ts`
- Modify: `src/components/Hero.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces:
  - `materials.ts`: `export function clay(color: string, opts?: { roughness?: number }): THREE.MeshStandardMaterial`; `export const PALETTE = { body: "#2b2c30", deep: "#1d1e21", mid: "#3a3b40", light: "#8e9096", red: "#cd393c", silicon: "#24233a" }`; `export function outline(mesh: THREE.Mesh, opacity?: number): THREE.LineSegments` (EdgesGeometry, threshold 30°, colour `#c8c8c8`, default opacity 0.18, transparent; adds itself to the mesh).
  - `textures.ts`: `export function dieTextures(): { base: HTMLCanvasElement; glow: HTMLCanvasElement; timing: HTMLCanvasElement }` (GH100 layout: 8 GPCs × 18 SMs, all 144 light; L2 band; HBM PHYs; restyled toward clay — desaturated, darker base; glow colour red/white); `export function pcbTexture(): HTMLCanvasElement` (charcoal-green, subtle traces).
  - `micro.ts`: `export function buildMicro(): { group: THREE.Group; setLit(t: number): void; setOpacity(o: number): void }` — a ~2×2 mm patch at the die centre (on the die's top surface, y ≈ 0): an 8×8 array of gate-all-around transistors (stacked nanosheet channels + wrap-around gate, clay with red gates), surrounded by standard-cell rows (thin rounded strips). `setLit` lights gates in a wave.
  - `scene.ts`: `export type BuildupScene = { update(p: number, time: number): void; resize(w: number, h: number): void; dispose(): void }`; `export function createBuildupScene(canvas: HTMLCanvasElement, opts: { mobile: boolean }): BuildupScene`. Renderer: ACES tone mapping, sRGB, clear `#111111`, pixel ratio ≤ 2 (≤ 1.5 mobile), soft key light + hemisphere fill + RoomEnvironment at low intensity (clay, not chrome). Uses `cameraAt(p)` for the camera; `camera.near = dist/60`.
  - `useBuildupScroll.ts`: `export function useBuildupScroll<T extends HTMLElement>(): React.RefObject<T | null>` — measures the runway, damps p (rate 6/s), applies `overlaysAt` / `levelAt` to DOM nodes `.chip-intro .chip-cue .chip-title .chip-endcap .chip-hud .chip-hud [data-level] .chip-hud-callout .chip-rail-fill`, sets `data-end`, lazily `import("@/components/buildup/scene")`, sets `data-scene-ready` to `"true"` / `"failed"`, rAF loop only while visible.
  - `Hero.tsx`: section `h-[300vh]` (`SCROLL_VH`), sticky stage, `<canvas className="hero-canvas">`, overlays as in the stashed hero (`git show stash@{1}:src/components/Hero.tsx` is the reference markup), readout listing `LEVELS`.

- [ ] **Step 1: Install** `bun add three@0.186.0 && bun add -d @types/three@0.186.0`.
- [ ] **Step 2: Implement** the files above; the scene at this point contains only the die (flat rounded box, die textures, timing shader gating glow by `progress(p,"toDie")`) and the micro patch. Port the timing shader from `git show 'stash@{1}^3:src/components/hero3d/scene.ts'` (`onBeforeCompile`, `vEmissiveMapUv`).
- [ ] **Step 3: Replace the chip-hero CSS** in `globals.css` (section "Chip hero" through just before "Below-the-hero sections") with the overlay rules from `git show stash@{1}:src/app/globals.css` (section "Hero overlays") plus `.hero-canvas` fade-in.
- [ ] **Step 4: Gates** — `npx tsc --noEmit -p . && bun run lint && bun test && bun run build`; all pass.
- [ ] **Step 5: Verify in the browser** (`preview_start start`, 1440×900): at p = 0 the headline shows immediately and transistors fade in behind; at p = 0.05 transistors are lit; at p = 0.26 the whole die is visible and its blocks have powered on. Block WebGL (`javascript_tool`: reload with `HTMLCanvasElement.prototype.getContext = () => null` injected before load is not possible; instead temporarily throw in the dynamic import) → headline, title at p = 1 and CTAs still work, `data-scene-ready="failed"`. Revert the temporary throw.
- [ ] **Step 6: Commit** `git commit -m "Build-up hero: scene shell, overlays, transistor and die stages"`.

---

### Task 3: Package and bare board, pull-back

**Files:**
- Create: `src/components/buildup/models/gpu.ts` (first half)
- Modify: `src/components/buildup/scene.ts`

**Interfaces:**
- Produces: `export function buildBoard(): { group: THREE.Group; dieAnchor: THREE.Object3D }` — card-local frame: PCB in the x–z plane (lying), components up (+y), long axis z (267), width x (111), die top at the group's origin. Contents: substrate (58×58), interposer, die, 6 HBM3e stacks (3 per side), stiffener caps, power stages along both long edges, bulk caps, 16-pin power connector, gold PCIe edge fingers, NVLink fingers, PCB with `pcbTexture()`. All rounded (RoundedBoxGeometry) and outlined via `outline()` on the larger parts only.

- [ ] **Step 1: Implement `buildBoard()`**; in `scene.ts` place it at the origin (solo pose) and fade the micro patch out over `progress(p,"toDie")` 0.4→1.
- [ ] **Step 2: Gates** pass.
- [ ] **Step 3: Verify**: p = 0.36 shows the whole bare board at a three-quarter angle, die and HBM readable, nothing blocky; p 0.10→0.36 is one smooth pull-back with no pop.
- [ ] **Step 4: Commit** `git commit -m "Build-up hero: package and bare board"`.

---

### Task 4: Casing, solo card, seven more cards, NVLink bridges

**Files:**
- Modify: `src/components/buildup/models/gpu.ts`, `src/components/buildup/scene.ts`

**Interfaces:**
- Produces: `export function buildCasing(): { parts: { obj: THREE.Object3D; from: Vec3; order: number }[] }` — the redesigned shroud in card-local coords: vapour chamber, fin stack, shroud body with chamfered long edges and a recessed channel along its top face, side cut-outs that reveal the fin stack, one red accent line along one long edge, bracket at the −z end, open fin end at +z. Each part has a `from` offset (where it flies in from) and an `order` for staggering.
- `export function buildCard(): THREE.Group` — `buildBoard()` + `buildCasing()` assembled (for the seven extra cards).
- `export function cardPose(p: number): { position: Vec3; rotation: Vec3 }` (in `scene.ts` or `gpu.ts`): solo pose until `join` starts; across `progress(p,"join")` it rotates to upright (components −x) and moves to slot 3 (`x = -154 + 3*44`, card centre z = 60, PCIe edge at `SERVER_FLOOR_Y + 20`).

- [ ] **Step 1: Implement**; casing parts animate in across `progress(p,"casing")` by `order`; the other seven cards arrive staggered across `progress(p,"join")` from above/behind into slots 0–2 and 4–7; two 4-way NVLink bridges (rounded, clay, red edge accent) drop onto cards 0–3 and 4–7 across `progress(p,"bridges")`.
- [ ] **Step 2: Gates** pass.
- [ ] **Step 3: Verify**: p = 0.47 — finished solo card, three-quarter view, reads instantly as a GPU card, shroud not "weird" (chamfers, channel, fin cut-outs visible); p = 0.55 — card turning upright as others arrive, no intersections; p = 0.62 — eight cards in a row under two bridges.
- [ ] **Step 4: Commit** `git commit -m "Build-up hero: casing, eight cards, NVLink bridges"`.

---

### Task 5: Server builds around the cards; x-ray ending

**Files:**
- Create: `src/components/buildup/models/server.ts`
- Modify: `src/components/buildup/scene.ts`

**Interfaces:**
- Produces: `export function buildServer(): { parts: Record<"switchboard" | "motherboard" | "fans" | "psus" | "chassis" | "lid", { obj: THREE.Object3D; from: Vec3 }[]>; shell: THREE.Mesh[] }` in world coords around the slots (4U, 448×176×800, floor at `SERVER_FLOOR_Y`). Contents: PCIe switch board with 8 x16 slots under the cards; motherboard with 2 CPUs + coolers + 32 DIMMs behind the cards; a fan wall of 60 mm fans in front of the cards (rotors spin); 4 PSUs at the rear; chassis = floor, two side walls, front panel (vents, drive bays as relief), rear panel; lid. `shell` lists the meshes that go x-ray.

- [ ] **Step 1: Implement**; each group flies in from its `from` offset across its step's `progress`. During `xray`, every `shell` mesh fades to 0.12 opacity (transparent, depthWrite off) while its outline rises to 0.6, so the 8 cards and their red accents stay visible through a closed server.
- [ ] **Step 2: Gates** pass.
- [ ] **Step 3: Verify**: p = 0.84 — closed server, opaque; p = 0.9 and p = 1 — x-ray: closed silhouette, GPUs visible inside; end title and CTAs readable over it; camera only drifted since p = 0.36.
- [ ] **Step 4: Commit** `git commit -m "Build-up hero: server build-around and x-ray ending"`.

---

### Task 6: Mobile, performance, polish

**Files:**
- Modify: `src/components/buildup/scene.ts`, `src/hooks/useBuildupScroll.ts`, `src/components/Hero.tsx`

- [ ] **Step 1: Mobile**: on `opts.mobile` use FOV 48 (34 desktop), pixel ratio ≤ 1.5, fewer DIMM/fin instances; readout shows names only (no notes) below 768 px.
- [ ] **Step 2: Verify at 375×812**: no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`), each of p = 0, 0.3, 0.47, 0.62, 0.84, 1 framed with the subject on screen and the readout legible.
- [ ] **Step 3: Verify resize**: at p = 0.6 resize 1440×900 → 900×1100 → 375×812; the frame never stretches.
- [ ] **Step 4: Gates** pass; commit `git commit -m "Build-up hero: mobile and polish"`.
