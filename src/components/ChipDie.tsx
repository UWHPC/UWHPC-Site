import type { CSSProperties, ReactNode } from "react";

/**
 * M4-style die floorplan for the scroll hero: wall-to-wall pattern
 * density, every region with its own texture. All geometry renders
 * twice — a dim grey skeleton and an ember-red lit overlay gated by
 * `--d`/`--w` — while pathways fill with color past `--td`/`--tw`.
 * Styling: globals.css "Chip hero".
 *
 * Timeline (one continuous camera swoop, p 0.05-0.70):
 *   0.04+   the die edge sweeps most of the way around, alone
 *   0.22+   badge, then cores crisscross, streets flood behind them
 *   0.42+   GPU blooms, SRAM macros scatter
 *   0.56+   media/memory/bricks sweep
 *   0.64+   bird's-eye freeze: channels flood, moat closes, title fades in
 *   0.83+   everything settled — long still dwell to the end of the runway
 */

function varStyle(vars: Record<string, string | number>) {
  return vars as CSSProperties;
}

function Block({ d, w, shape }: { d: number; w?: number; shape: ReactNode }) {
  return (
    <g className="chip-block" style={varStyle(w ? { "--d": d, "--w": w } : { "--d": d })}>
      <g className="chip-block-base">{shape}</g>
      <g className="chip-block-lit">{shape}</g>
    </g>
  );
}

/** A gap between blocks: a dark channel that floods with color. */
function Gap({
  d,
  td,
  tw,
  sw,
  color,
}: {
  d: string;
  td: number;
  tw?: number;
  sw?: number;
  color: string;
}) {
  const vars: Record<string, string | number> = { "--td": td, "--tc": color };
  if (tw) vars["--tw"] = tw;
  if (sw) vars["--sw"] = sw;
  return (
    <g className="chip-trace-group" style={varStyle(vars)}>
      <path className="chip-trace-base" d={d} />
      <path className="chip-trace" pathLength={1} d={d} />
      <path className="chip-trace-pulse" pathLength={1} d={d} />
    </g>
  );
}

const COPPER = "#dd6e4f";
const RED = "#e0494d";

function vLines(x0: number, y0: number, y1: number, step: number, count: number) {
  return Array.from({ length: count }, (_, i) => (
    <line key={`v${i}`} x1={x0 + i * step} y1={y0} x2={x0 + i * step} y2={y1} />
  ));
}

function hLines(y0: number, x0: number, x1: number, step: number, count: number) {
  return Array.from({ length: count }, (_, i) => (
    <line key={`h${i}`} x1={x0} y1={y0 + i * step} x2={x1} y2={y0 + i * step} />
  ));
}

/** Tiny parallel ticks — the comb fringe on SRAM-style macros. */
function comb(x0: number, y: number, count: number, step: number, len: number) {
  return Array.from({ length: count }, (_, i) => (
    <line key={`c${i}`} x1={x0 + i * step} y1={y} x2={x0 + i * step} y2={y + len} />
  ));
}

/** Badge block: the UWHPC chip mark as pure line art (no text). */
function badgeShape() {
  return (
    <>
      <rect x={84} y={84} width={288} height={124} rx={4} />
      {/* chip body + core */}
      <rect x={250} y={108} width={76} height={76} rx={10} />
      <rect className="chip-cell" x={266} y={124} width={44} height={44} rx={4} />
      {/* pins */}
      {[118, 134, 150, 166].map((y) => (
        <rect key={y} className="chip-cell" x={332} y={y} width={12} height={8} rx={1} />
      ))}
      {/* speed trails */}
      <line x1={140} y1={126} x2={244} y2={126} />
      <line x1={116} y1={146} x2={244} y2={146} />
      <line x1={140} y1={166} x2={244} y2={166} />
      <circle cx={128} cy={126} r={4} />
      <circle cx={104} cy={146} r={4} />
      <circle cx={128} cy={166} r={4} />
    </>
  );
}

/** Performance core: header band + tall nested column cage. */
function pCoreShape(x: number) {
  return (
    <>
      <rect x={x} y={220} width={66} height={280} rx={3} />
      {hLines(230, x + 6, x + 60, 8, 3)}
      <rect x={x + 8} y={258} width={50} height={232} rx={2} />
      <rect className="chip-cell" x={x + 16} y={274} width={34} height={200} rx={2} />
      {vLines(x + 24, 282, 466, 6, 4)}
      <rect className="chip-cell" x={x + 14} y={262} width={38} height={8} rx={1} />
    </>
  );
}

/** Efficiency unit: ringed register cell. */
function eUnitShape(x: number, y: number) {
  return (
    <>
      <rect x={x} y={y} width={90} height={49} rx={2} />
      <rect className="chip-cell" x={x + 31} y={y + 10} width={28} height={29} rx={2} />
      {hLines(y + 12, x + 6, x + 26, 8, 4)}
      {hLines(y + 12, x + 64, x + 84, 8, 4)}
    </>
  );
}

export default function ChipDie() {
  // GPU: 5x3 repeated shader units
  const gpuUnits: ReactNode[] = [];
  [408, 469, 530, 591, 652].forEach((x) => {
    [92, 195, 298].forEach((y) => {
      gpuUnits.push(
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={56} height={98} rx={2} />
          <rect className="chip-cell" x={x + 6} y={y + 6} width={44} height={66} rx={2} />
          {vLines(x + 15, y + 12, y + 66, 9, 3)}
          <rect className="chip-cell" x={x + 6} y={y + 78} width={44} height={14} rx={1} />
          <line x1={x + 6} y1={y + 85} x2={x + 50} y2={y + 85} />
        </g>
      );
    });
  });

  // SRAM macro: comb fringes top/bottom around a nested center
  const sramMacro = (x: number) => (
    <>
      <rect x={x} y={420} width={100} height={80} rx={2} />
      {comb(x + 6, 424, 16, 6, 8)}
      {comb(x + 6, 488, 16, 6, 8)}
      <rect className="chip-cell" x={x + 22} y={440} width={56} height={40} rx={2} />
      <rect className="chip-cell" x={x + 38} y={450} width={24} height={20} rx={1} />
      {hLines(444, x + 26, x + 74, 32, 2)}
    </>
  );

  // memory: brick rows of striped cells
  const memCells: ReactNode[] = [];
  [84, 158, 232, 306].forEach((x) => {
    [616, 669].forEach((y) => {
      memCells.push(
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={66} height={47} rx={2} />
          {vLines(x + 11, y + 6, y + 41, 11, 5)}
        </g>
      );
    });
  });

  // right-edge brick column
  const bricks: ReactNode[] = [];
  [594, 656].forEach((x) => {
    [512, 542, 572, 602].forEach((y) => {
      bricks.push(
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={54} height={26} rx={1} />
          <line x1={x + 6} y1={y + 13} x2={x + 48} y2={y + 13} />
        </g>
      );
    });
  });

  return (
    <svg
      viewBox="0 0 800 800"
      className="chip-svg"
      role="img"
      aria-label="Stylized processor die lighting up: blocks glow and signal pathways fill like fluid"
    >
      <defs>
        <radialGradient id="chip-die-grad" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#141414" />
          <stop offset="100%" stopColor="#0e0e0e" />
        </radialGradient>
      </defs>

      <rect className="chip-die-base" x={70} y={70} width={660} height={660} rx={14} fill="url(#chip-die-grad)" />
      <rect className="chip-die-edge" pathLength={1} x={70} y={70} width={660} height={660} rx={14} />

      {/* ---- left half ---- */}
      {/* badge block first: the brand mark wakes the die */}
      <Block d={0.22} w={0.1} shape={badgeShape()} />

      {/* performance cores pop crisscross 1-3-2-4 */}
      <Block d={0.26} shape={pCoreShape(84)} />
      <Block d={0.3} shape={pCoreShape(158)} />
      <Block d={0.28} shape={pCoreShape(232)} />
      <Block d={0.32} shape={pCoreShape(306)} />

      {/* efficiency units: checkerboard scatter */}
      <Block d={0.34} w={0.06} shape={eUnitShape(84, 506)} />
      <Block d={0.36} w={0.06} shape={eUnitShape(182, 506)} />
      <Block d={0.38} w={0.06} shape={eUnitShape(280, 506)} />
      <Block d={0.37} w={0.06} shape={eUnitShape(84, 561)} />
      <Block d={0.35} w={0.06} shape={eUnitShape(182, 561)} />
      <Block d={0.39} w={0.06} shape={eUnitShape(280, 561)} />

      {/* memory bricks sweep awake */}
      <Block d={0.58} w={0.09} shape={<>{memCells}</>} />

      {/* ---- right half ---- */}
      {/* GPU blooms slowly */}
      <Block
        d={0.42}
        w={0.12}
        shape={
          <>
            <rect x={400} y={84} width={316} height={330} rx={3} />
            {gpuUnits}
          </>
        }
      />

      {/* SRAM macros scatter: middle, right, left */}
      <Block d={0.47} shape={sramMacro(508)} />
      <Block d={0.49} shape={sramMacro(616)} />
      <Block d={0.51} shape={sramMacro(400)} />

      {/* media engine ladder */}
      <Block
        d={0.56}
        w={0.08}
        shape={
          <>
            <rect x={400} y={506} width={180} height={124} rx={3} />
            <rect className="chip-cell" x={412} y={520} width={28} height={96} rx={2} />
            <rect className="chip-cell" x={540} y={520} width={28} height={96} rx={2} />
            {hLines(530, 448, 532, 11, 8)}
            <rect className="chip-cell" x={466} y={514} width={48} height={108} rx={2} />
          </>
        }
      />

      {/* brick PHY column */}
      <Block d={0.595} w={0.07} shape={<>{bricks}</>} />

      {/* bottom strips */}
      <Block
        d={0.615}
        w={0.07}
        shape={
          <>
            <rect x={400} y={636} width={150} height={80} rx={2} />
            {vLines(412, 644, 708, 14, 10)}
          </>
        }
      />
      <Block
        d={0.625}
        w={0.07}
        shape={
          <>
            <rect x={558} y={636} width={158} height={80} rx={2} />
            {[566, 618, 668].map((x) => (
              <rect key={x} className="chip-cell" x={x} y={648} width={40} height={26} rx={2} />
            ))}
            {hLines(684, 566, 708, 10, 3)}
          </>
        }
      />

      {/* ---- the gaps between blocks: dark channels that flood ----
          No individual connectors — the streets and channels of the
          floorplan itself light up after their neighbouring blocks. */}
      <g className="chip-traces">
        {/* badge channel, then the streets between cores (1-3-2) */}
        <Gap d="M 84 214 H 372" td={0.24} tw={0.13} sw={8} color={COPPER} />
        <Gap d="M 154 220 V 500" td={0.28} tw={0.11} color={COPPER} />
        <Gap d="M 302 220 V 500" td={0.3} tw={0.11} color={COPPER} />
        <Gap d="M 228 220 V 500" td={0.32} tw={0.11} color={COPPER} />
        {/* streets around the e-units */}
        <Gap d="M 178 506 V 610" td={0.37} tw={0.1} color={COPPER} />
        <Gap d="M 276 506 V 610" td={0.385} tw={0.1} color={COPPER} />
        <Gap d="M 84 558 H 372" td={0.4} tw={0.1} color={COPPER} />

        {/* the channel under the GPU sweeps, then SRAM streets */}
        <Gap d="M 400 417 H 716" td={0.46} tw={0.14} color={COPPER} />
        <Gap d="M 504 420 V 500" td={0.5} tw={0.1} color={COPPER} />
        <Gap d="M 612 420 V 500" td={0.52} tw={0.1} color={COPPER} />

        {/* streets around media, bricks, memory */}
        <Gap d="M 584 506 V 630" td={0.585} tw={0.1} color={COPPER} />
        <Gap d="M 652 506 V 630" td={0.6} tw={0.1} color={COPPER} />
        <Gap d="M 154 616 V 716" td={0.6} tw={0.1} color={COPPER} />
        <Gap d="M 228 616 V 716" td={0.61} tw={0.1} color={COPPER} />
        <Gap d="M 302 616 V 716" td={0.62} tw={0.1} color={COPPER} />
        <Gap d="M 554 636 V 716" td={0.63} tw={0.1} color={COPPER} />

        {/* FINALE (long bird's-eye freeze): the main channels flood
            one by one, ending with the perimeter moat */}
        <Gap d="M 386 84 V 716" td={0.64} tw={0.1} sw={9} color={RED} />
        <Gap d="M 84 503 H 372" td={0.66} tw={0.09} sw={5} color={COPPER} />
        <Gap d="M 400 503 H 716" td={0.675} tw={0.09} sw={5} color={COPPER} />
        <Gap d="M 84 613 H 372" td={0.69} tw={0.09} sw={5} color={COPPER} />
        <Gap d="M 84 666 H 372" td={0.705} tw={0.09} sw={5} color={COPPER} />
        <Gap d="M 400 633 H 716" td={0.72} tw={0.09} sw={5} color={COPPER} />
        <Gap
          d="M 110 77 H 690 A 33 33 0 0 1 723 110 V 690 A 33 33 0 0 1 690 723 H 110 A 33 33 0 0 1 77 690 V 110 A 33 33 0 0 1 110 77 Z"
          td={0.72}
          tw={0.11}
          sw={8}
          color={RED}
        />
      </g>
    </svg>
  );
}
