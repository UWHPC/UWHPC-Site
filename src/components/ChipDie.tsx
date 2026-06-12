import type { CSSProperties, ReactNode } from "react";

/**
 * M4-style die floorplan for the scroll hero: wall-to-wall pattern
 * density, every region with its own texture. All geometry renders
 * twice — a dim grey skeleton and an ember-red lit overlay gated by
 * `--d`/`--w` — while pathways fill with color past `--td`/`--tw`.
 * Styling: globals.css "Chip hero".
 *
 * Timeline (camera holds in useScrollProgress MOVES):
 *   HOLD A  0.16-0.28  badge, then cores crisscross, lines spill out
 *   HOLD B  0.36-0.46  GPU blooms, SRAM macros scatter
 *   HOLD C  0.54-0.60  media/memory/bricks sweep
 *   FINALE  0.68-1.00  bird's-eye freeze, fabric stitches together
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

function Trace({
  d,
  td,
  tw,
  color,
}: {
  d: string;
  td: number;
  tw?: number;
  color: string;
}) {
  return (
    <g
      className="chip-trace-group"
      style={varStyle(tw ? { "--td": td, "--tc": color, "--tw": tw } : { "--td": td, "--tc": color })}
    >
      <path className="chip-trace-base" d={d} />
      <path className="chip-trace" pathLength={1} d={d} />
      <path className="chip-trace-pulse" pathLength={1} d={d} />
    </g>
  );
}

const CYAN = "#4cc9f0";
const BLUE = "#5a8bff";
const VIOLET = "#b15cff";
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
  const padsTop: ReactNode[] = [];
  const padsBottom: ReactNode[] = [];
  const padsLeft: ReactNode[] = [];
  const padsRight: ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const along = 118 + i * 48;
    padsTop.push(<rect key={i} x={along} y={48} width={20} height={12} rx={2} />);
    padsBottom.push(<rect key={i} x={along} y={740} width={20} height={12} rx={2} />);
    padsLeft.push(<rect key={i} x={48} y={along} width={12} height={20} rx={2} />);
    padsRight.push(<rect key={i} x={740} y={along} width={12} height={20} rx={2} />);
  }

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
          <stop offset="0%" stopColor="#161616" />
          <stop offset="100%" stopColor="#101010" />
        </radialGradient>
      </defs>

      <g className="chip-pads">
        {padsTop}
        {padsBottom}
        {padsLeft}
        {padsRight}
      </g>

      <rect className="chip-die-base" x={70} y={70} width={660} height={660} rx={14} fill="url(#chip-die-grad)" />
      <rect className="chip-die-edge" pathLength={1} x={70} y={70} width={660} height={660} rx={14} />

      {/* permanent grey routing fabric */}
      <g className="chip-fabric">
        {[
          // doubled channel runs
          "M 92 211 H 364",
          "M 110 217 H 340",
          "M 92 500 H 364",
          "M 120 509 H 330",
          "M 92 610 H 364",
          "M 408 414 H 700",
          "M 420 420 H 680",
          "M 408 630 H 700",
          "M 380 100 V 700",
          "M 392 130 V 670",
          // stubs
          "M 130 470 V 530",
          "M 250 480 V 525",
          "M 320 630 V 590",
          "M 440 385 V 435",
          "M 560 380 V 440",
          "M 680 385 V 430",
          "M 470 530 V 480",
          "M 630 535 V 485",
          // edge taps
          "M 84 300 H 73",
          "M 716 260 H 727",
          "M 716 560 H 727",
          "M 250 716 V 727",
          "M 500 716 V 727",
          "M 84 660 H 73",
          "M 320 84 V 73",
          "M 600 84 V 73",
        ].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* ---- left half ---- */}
      {/* badge block first: the brand mark wakes the die */}
      <Block d={0.145} shape={badgeShape()} />

      {/* HOLD A: performance cores pop crisscross 1-3-2-4 */}
      <Block d={0.16} shape={pCoreShape(84)} />
      <Block d={0.2} shape={pCoreShape(158)} />
      <Block d={0.18} shape={pCoreShape(232)} />
      <Block d={0.22} shape={pCoreShape(306)} />

      {/* efficiency units: checkerboard scatter */}
      <Block d={0.24} w={0.04} shape={eUnitShape(84, 506)} />
      <Block d={0.26} w={0.04} shape={eUnitShape(182, 506)} />
      <Block d={0.28} w={0.04} shape={eUnitShape(280, 506)} />
      <Block d={0.27} w={0.04} shape={eUnitShape(84, 561)} />
      <Block d={0.25} w={0.04} shape={eUnitShape(182, 561)} />
      <Block d={0.29} w={0.04} shape={eUnitShape(280, 561)} />

      {/* HOLD C: memory bricks sweep awake */}
      <Block d={0.56} w={0.07} shape={<>{memCells}</>} />

      {/* ---- right half ---- */}
      {/* HOLD B: GPU blooms slowly */}
      <Block
        d={0.36}
        w={0.09}
        shape={
          <>
            <rect x={400} y={84} width={316} height={330} rx={3} />
            {gpuUnits}
          </>
        }
      />

      {/* SRAM macros scatter: middle, right, left */}
      <Block d={0.41} shape={sramMacro(508)} />
      <Block d={0.435} shape={sramMacro(616)} />
      <Block d={0.455} shape={sramMacro(400)} />

      {/* HOLD C: media engine ladder */}
      <Block
        d={0.54}
        w={0.06}
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
      <Block d={0.575} w={0.05} shape={<>{bricks}</>} />

      {/* bottom strips */}
      <Block
        d={0.59}
        w={0.05}
        shape={
          <>
            <rect x={400} y={636} width={150} height={80} rx={2} />
            {vLines(412, 644, 708, 14, 10)}
          </>
        }
      />
      <Block
        d={0.605}
        w={0.05}
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

      {/* ---- pathways: grey pipes that fill like fluid ---- */}
      <g className="chip-traces">
        {/* HOLD A: lines spill out of each core as it lights (1-3-2-4) */}
        <Trace d="M 117 470 V 530" td={0.18} tw={0.09} color={CYAN} />
        <Trace d="M 265 475 V 525" td={0.2} tw={0.09} color={BLUE} />
        <Trace d="M 191 465 V 535" td={0.22} tw={0.09} color={CYAN} />
        <Trace d="M 339 470 V 530" td={0.24} tw={0.09} color={VIOLET} />

        {/* HOLD B: GPU reaches back to the cores, then down into SRAM */}
        <Trace d="M 420 260 H 350" td={0.39} tw={0.08} color={CYAN} />
        <Trace d="M 420 340 H 350" td={0.41} tw={0.08} color={BLUE} />
        <Trace d="M 430 385 V 440" td={0.42} tw={0.08} color={CYAN} />
        <Trace d="M 520 380 V 435" td={0.435} tw={0.08} color={BLUE} />
        <Trace d="M 610 385 V 440" td={0.45} tw={0.08} color={VIOLET} />
        <Trace d="M 690 380 V 435" td={0.46} tw={0.08} color={CYAN} />

        {/* HOLD C: media/memory/bricks reach outward as they wake */}
        <Trace d="M 450 530 V 475" td={0.56} tw={0.08} color={BLUE} />
        <Trace d="M 530 535 V 480" td={0.57} tw={0.08} color={CYAN} />
        <Trace d="M 117 630 V 590" td={0.58} tw={0.08} color={VIOLET} />
        <Trace d="M 191 625 V 585" td={0.59} tw={0.08} color={BLUE} />
        <Trace d="M 265 630 V 590" td={0.6} tw={0.08} color={CYAN} />
        <Trace d="M 620 530 V 485" td={0.585} tw={0.08} color={BLUE} />
        <Trace d="M 700 535 V 490" td={0.61} tw={0.08} color={VIOLET} />

        {/* FINALE (long bird's-eye freeze): the fabric stitches together */}
        <Trace d="M 386 100 V 700" td={0.68} tw={0.16} color={RED} />
        <Trace d="M 92 214 H 364" td={0.7} tw={0.14} color={VIOLET} />
        <Trace d="M 408 417 H 708" td={0.72} tw={0.14} color={CYAN} />
        <Trace d="M 92 503 H 364" td={0.74} tw={0.14} color={CYAN} />
        <Trace d="M 408 633 H 708" td={0.76} tw={0.14} color={BLUE} />
        <Trace d="M 300 214 H 386 V 417 H 408" td={0.71} tw={0.15} color={CYAN} />
        <Trace d="M 250 503 H 386 V 633 H 408" td={0.75} tw={0.15} color={BLUE} />
        <Trace d="M 408 503 H 580" td={0.78} tw={0.11} color={VIOLET} />
        <Trace d="M 92 613 H 364" td={0.77} tw={0.12} color={VIOLET} />
        <Trace d="M 339 625 V 585" td={0.79} tw={0.1} color={BLUE} />
        <Trace d="M 560 380 V 440" td={0.8} tw={0.1} color={CYAN} />
        <Trace d="M 470 636 V 600" td={0.82} tw={0.1} color={BLUE} />

        {/* edge taps land last */}
        <Trace d="M 84 260 H 73" td={0.84} tw={0.1} color={RED} />
        <Trace d="M 716 230 H 727" td={0.85} tw={0.1} color={CYAN} />
        <Trace d="M 180 716 V 727" td={0.86} tw={0.1} color={BLUE} />
        <Trace d="M 540 716 V 727" td={0.87} tw={0.1} color={VIOLET} />
        <Trace d="M 84 600 H 73" td={0.88} tw={0.1} color={CYAN} />
        <Trace d="M 716 620 H 727" td={0.89} tw={0.1} color={BLUE} />
        <Trace d="M 250 84 V 73" td={0.9} tw={0.1} color={VIOLET} />
        <Trace d="M 480 84 V 73" td={0.91} tw={0.09} color={CYAN} />
      </g>
    </svg>
  );
}
