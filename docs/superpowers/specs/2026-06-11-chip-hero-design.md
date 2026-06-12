# Chip Hero — Scroll-Driven Die Animation

Date: 2026-06-11
Branch: 3d-design (extends the similar-redesign datasheet system)

## Concept

The hero is a dim processor die seen from a slightly isometric angle (top view,
tilted so the package sides are visible). As the user scrolls:

1. the die edge traces in with a red glow and the package pads silver up
2. floorplan blocks (CPU cores, L2, GPU, NPU, SLC, IO, MEM) glow in staggered
   sequence — brand red, Apple-silicon style
3. cyan/blue/violet signal traces draw between blocks, then carry continuous
   "light packet" pulses
4. the camera flattens to a full bird's-eye view; the CTAs resolve

The headline (same copy as before) shows at the start and fades up as the chip
wakes. CTAs (Join the Team / Learn More) appear at the end of the sequence.

## Architecture

- `src/components/Hero.tsx` — a 320vh runway `<section class="chip-stage">`
  containing a `sticky top-0 h-screen` stage. No animation library.
- `src/hooks/useScrollProgress.ts` — writes scroll progress (0..1) to the
  section as `--p` once per rAF, plus a `data-end` flag for visibility gating.
- `src/components/ChipDie.tsx` — the SVG floorplan. Blocks carry `--d` (light-up
  offset), traces carry `--td` (draw offset) and `--tc` (color).
- `globals.css` ("Chip hero" block) — derives every phase from `--p` via
  `clamp(calc())`: `--title`, `--edge`, `--amb`, `--cam`, `--endcap`, per-block
  `--bp`, per-trace `--tp`. Transforms/opacity only; glows via drop-shadow.
- 3D: CSS perspective + `rotateX/rotateZ` on a `preserve-3d` die with real side
  faces hung off the bottom/right edges, so the silhouette is genuinely 3D at
  the start and the sides vanish naturally at bird's-eye.

## Camera path

All scroll-derived, always active (the sequence is scrubbed by the user's own
scrolling, so it is not gated on prefers-reduced-motion):

1. opens zoomed in (1.3x) over the CPU corner, tilted (rotateX 58deg) and
   orbited (rotateZ -20deg)
2. `--cam-pan` (p 0.02-0.42): pans across the die toward the GPU/IO side while
   the orbit eases to -8deg
3. `--cam-pull` (p 0.34-0.64): pulls back until the whole die is framed
4. `--cam` (p 0.62-0.94): flattens to bird's-eye with a slight zoom-in

## Accessibility / robustness

- `prefers-reduced-motion`: only self-running effects (trace pulses, blink
  dot) are frozen by the global reduced-motion rule; the scroll-scrubbed
  sequence still works since the user controls it.
- SSR first paint is the dim p=0 state; no hydration-sensitive markup.
- CTAs are `visibility: hidden` until the end phase so invisible buttons can't
  be focused/clicked over the chip.
