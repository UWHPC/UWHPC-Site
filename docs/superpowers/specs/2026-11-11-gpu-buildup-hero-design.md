# GPU build-up hero — design

Date: 2026-11-11
Branch: `redesign/gpu-buildup-hero` (from `072b386` on `redesign/hero-and-projects`)

## Intent

The home-page hero for UWHPC (a student HPC design team at Waterloo) tells one
story as you scroll: **from a single transistor up to a closed, 8-GPU server**.
It should make a visitor think "that looks awesome" and, underneath, show that
the team understands the whole stack, from silicon to systems.

This replaces two earlier attempts the team rejected:

- a realistic 3D datacentre fly-through: models looked blocky, the GPU casing
  looked weird, and the camera zooming out through everything felt wrong;
- a flat line-art exploded GPU (liked, but they want this 3D story).

The key change from the fly-through: **after the GPU board, the camera stops
travelling and the server is built around the GPU** instead of zooming out.

## The sequence (decided with the team)

1. **Transistors.** Open close on transistors.
2. **Quick pull-back** to the die (its compute blocks powering on), then to the
   bare GPU board (die on its package on the PCB). This is the only part where
   the camera travels any distance; a fast, smooth pull-back is fine here.
3. **One GPU.** The camera settles. The GPU's casing assembles around the bare
   board until it is a single finished, enclosed GPU.
4. **More GPUs join** — seven more, until there are eight.
5. **The server builds around them** — the rest of the parts and then the case.
6. **Final frame:** the full server node, **closed up, with all 8 GPUs inside**.

Team quote: "transistors to the internal die to the bare pcb is good" … "instead
of zooming out through everything we build everything around the gpu".

## Look (decided)

**Clay / product-render style** (option B in the brainstorm mockups): matte
charcoal materials, soft lighting, rounded edges, red (`#cd393c`) used sparingly
as the accent. Calm and premium, not photoreal. It must sit on the site's dark
page (`#111111` background, silver `#c8c8c8`, red accent).

They also liked the "technical drawing in 3D" option (dark solids, light
outlines). **My call:** borrow a faint light edge outline from it so parts stay
crisp against the dark page; keep it subtle so the result reads as clay first.

## Goals

- The transistor → die → board → GPU → server story reads clearly to a
  non-expert, scale by scale.
- Every model looks deliberate: rounded, proportioned, never blocky. The GPU is
  recognisably a GPU.
- Parts arriving and locking into place is the main motion after the board.
- The headline is readable immediately on load; the 3D never blocks first paint.
- Works on desktop and phones.

## Non-goals

- No datacentre, rack or aisle. The story ends at one server.
- No photorealism, no vendor branding or logos on the models.
- No change to the rest of the page (statement, projects, focus areas,
  sponsors, join, footer).

## Anti-goals (would be a failure even if it works)

- The camera flying long distances or zooming out through levels after the
  board.
- Models that look like stacked boxes, or a GPU casing that looks "weird".
- A long, sluggish scroll where nothing happens for a while.
- The 3D blocking or delaying the headline.

## Constraints

- Stack: Next.js 16 (App Router), React 19, Tailwind 4, TypeScript. Built and
  checked with `bun run build`, `bun run lint`, `npx tsc --noEmit`.
- 3D: three.js. An earlier branch pinned `three@0.186.0` with
  `@types/three@0.186.0`; use the same version. Load the scene with a dynamic
  import after first paint (as the stashed 3D hero did).
- Ignore `prefers-reduced-motion` (the team asked for animations always on).
- Render only while the hero is on screen.
- Keep the existing hero overlays' roles: opening headline + kicker on load,
  title + CTAs ("Get Involved" → `/join`, "Learn More" → `#about`) at the end,
  scale readout with project callouts, "Skip intro" link.
- No image or model files: geometry and textures are procedural (canvas
  textures are fine).

## Decisions made in conversation (as decided)

- Sequence and ending above.
- Clay style.
- Quick pull-back allowed for transistor → die → board.
- New branch.

## After the design review (team answers and my calls)

- **Ending (team asked for my recommendation; my call):** the lid closes as a
  solid part, then the server's shell fades to an outline-only "x-ray" state:
  faint fill, light edge lines. The final frame reads as a closed server while
  the 8 GPUs (with their red accents) stay visible inside. End title and CTAs
  sit over this frame.
- **Why the old casing looked weird (team):** mostly how it was rendered; the
  shroud shape looked a bit off; cards standing vertical felt odd but may be
  unavoidable.
  - Rendering is addressed by the clay look.
  - **Orientation (my call):** cards are vertical in the finished server
    (that's how real 8-card servers seat them). For the solo GPU moment the
    card is presented at a flattering three-quarter angle, lying down, and
    rotates upright as it moves into its slot when the other seven arrive.
  - **Shroud redesign (my call):** not a flat box. Chamfered edges, a recessed
    channel along the top face, side cut-outs that reveal the fin stack, one
    red accent line, and the bracket and open fin end kept so it still reads as
    a GPU card.
- **Names (team: "up to you"; my call):** the scale readout and callouts name
  real parts — e.g. "4N · 80B transistors", "GH100", "H200", "NVLink" — while
  the models themselves stay unbranded. Readout levels and copy:
  - Transistor: "TSMC 4N · 80 billion per die"
  - Die: "GH100 · 144 SMs, full die" (132 is the SXM part; the PCIe H100
    enables 114, so the full-die figure is the one that's always true;
    all 144 SMs light in the die animation)
  - GPU: "H200 · 141 GB HBM3e" — callout: Maverick (one GPU)
  - Server: "8 GPUs over NVLink" — callout: BATS (across GPUs)
  The old "…and scales out across nodes" line is dropped (no cluster level).

## My calls (not explicitly confirmed by the team)

- **GPU form factor:** an enclosed PCIe card in the shape of an H200 NVL
  (full-length, dual-slot, passive: shroud, bracket at one end, open fin ends),
  because the team wants a "casing", with the shroud redesigned as above. In
  clay style it carries no branding; its shape and a red accent make it read as
  a GPU. The eight cards sit in a row and two 4-way NVLink bridges clip across
  their tops.
- **Server:** a 4U PCIe GPU server (realistic for 8 double-width cards). Parts
  that build around the cards, roughly in this order: the PCIe switch board the
  cards seat into, motherboard with two CPUs + coolers and DIMMs, fan wall, PSUs,
  then the chassis (floor, walls, front panel), and last the lid. Exact order
  and choreography are the builder's.
- **Transistor stage:** stylised gate-all-around / FinFET-style transistors in a
  small array, then standard-cell rows, then the die — scale changes may
  cross-fade between scenes because the scales differ by ~10⁶.
- **Die:** reuse the GH100-style die floorplan and its "blocks power on" effect
  from the stashed 3D hero (a canvas die texture with a per-block timing map);
  restyle to suit clay.
- **Scroll length:** shorter than the old 500vh; around 300vh is my starting
  guess.
- **Camera after the board:** mostly fixed, a slow orbit/drift, framing widens
  as the build grows so the whole server fits by the end.
- **Scale readout levels:** Transistor · Die · GPU · Server, keeping the project
  callouts (Maverick at the single GPU, BATS once the GPUs multiply).

## Prior art in the repo

- `git stash list` → `stash@{1}`: the realistic three.js hero
  (`src/components/hero3d/scene.ts`, `textures.ts`, `src/hooks/useScrollProgress.ts`,
  `Hero.tsx`). Useful for: dynamic-import pattern, scroll damping loop,
  overlays, die texture + timing shader, rounded-box helpers, H200 NVL card
  proportions. Its *look* and camera are what the team rejected.
- `stash@{0}`: the line-art exploded GPU (`ExplodedGpu.tsx`), for layer
  vocabulary and callout copy.
- Current committed `Hero.tsx` on this branch is the older SVG chip hero; it
  gets replaced.

## Left to the builder

- Exact timings, easing, and camera framing per step.
- Model detail level (within "deliberate, rounded, not blocky").
- Lighting setup for the clay look, and how strong the edge outline is.
- Whether the transistor stage is its own scene or a scaled group.
- Performance tactics (instancing, pixel-ratio caps, mobile simplifications).
