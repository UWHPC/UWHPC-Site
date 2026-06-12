import type { CSSProperties, ReactNode } from "react";

/**
 * Dense M1-style die floorplan for the scroll hero. Everything is
 * faintly outlined in grey from the start — including the full
 * routing fabric — and blocks tint ember-red as `--p` passes their
 * `--d` offset while pathways fill with glowing color as `--p`
 * passes their `--td` offset. Styling: globals.css "Chip hero".
 *
 * Timeline (camera holds in useScrollProgress MOVES):
 *   HOLD A  0.16-0.28  cores pop crisscross, lines spill out
 *   HOLD B  0.36-0.46  GPU blooms, logic blocks scatter
 *   HOLD C  0.54-0.60  memory + IO sweep
 *   FINALE  0.68-1.00  bird's-eye freeze, fabric stitches together
 */

function varStyle(vars: Record<string, string | number>) {
  return vars as CSSProperties;
}

/** Renders the same geometry twice: a dim grey base and a lit overlay. */
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
    <line key={i} x1={x0 + i * step} y1={y0} x2={x0 + i * step} y2={y1} />
  ));
}

function hLines(y0: number, x0: number, x1: number, step: number, count: number) {
  return Array.from({ length: count }, (_, i) => (
    <line key={i} x1={x0} y1={y0 + i * step} x2={x1} y2={y0 + i * step} />
  ));
}

/** Performance core: tall block with column structure and register islands. */
function pCore(x: number) {
  return (
    <>
      <rect x={x} y={110} width={62} height={220} rx={3} />
      {vLines(x + 15.5, 122, 318, 15.5, 3)}
      <rect className="chip-cell" x={x + 10} y={132} width={42} height={24} rx={2} />
      <rect className="chip-cell" x={x + 10} y={210} width={42} height={18} rx={2} />
      <rect className="chip-cell" x={x + 10} y={284} width={42} height={24} rx={2} />
    </>
  );
}

/** Efficiency core: shorter, simpler column block. */
function eCore(x: number) {
  return (
    <>
      <rect x={x} y={345} width={62} height={100} rx={3} />
      {vLines(x + 20.5, 355, 435, 20.5, 2)}
      <rect className="chip-cell" x={x + 12} y={365} width={38} height={20} rx={2} />
    </>
  );
}

/** Permanent grey routing fabric — never lights, pure texture. */
const FABRIC_ROUTES = [
  // doubled-up channel runs
  "M 130 334 H 370",
  "M 150 341 H 350",
  "M 130 448.5 H 368",
  "M 160 456.5 H 340",
  "M 393 130 V 680",
  "M 401 150 V 660",
  "M 420 394 H 680",
  "M 430 402 H 660",
  "M 420 563.5 H 670",
  "M 430 571.5 H 650",
  // block stubs
  "M 160 300 V 375",
  "M 232 305 V 370",
  "M 160 425 V 485",
  "M 328 420 V 495",
  "M 490 355 V 435",
  "M 610 360 V 430",
  "M 510 545 V 598",
  "M 660 540 V 602",
  // edge taps
  "M 110 260 H 74",
  "M 690 320 H 726",
  "M 320 690 V 726",
  "M 450 690 V 726",
  "M 690 540 H 726",
  "M 110 540 H 74",
];

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

  // GPU band cells: 3 rows x 4 cols of slots between the column lines
  const gpuCells: ReactNode[] = [];
  [140, 233, 326].forEach((y) => {
    [420, 487, 554, 621].forEach((x) => {
      gpuCells.push(
        <rect key={`${x}-${y}`} className="chip-cell" x={x} y={y} width={40} height={22} rx={2} />
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

      {/* package pads, echoing the logo's pins */}
      <g className="chip-pads">
        {padsTop}
        {padsBottom}
        {padsLeft}
        {padsRight}
      </g>

      {/* die outline: dim base + scroll-drawn glowing edge */}
      <rect className="chip-die-base" x={70} y={70} width={660} height={660} rx={14} fill="url(#chip-die-grad)" />
      <rect className="chip-die-edge" pathLength={1} x={70} y={70} width={660} height={660} rx={14} />

      {/* permanent grey routing fabric */}
      <g className="chip-fabric">
        {FABRIC_ROUTES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* ---- left half ---- */}
      {/* HOLD A: performance cores pop crisscross 1-3-2-4,
          then efficiency cores in a different scatter */}
      <Block d={0.16} shape={pCore(110)} />
      <Block d={0.2} shape={pCore(182)} />
      <Block d={0.18} shape={pCore(254)} />
      <Block d={0.22} shape={pCore(326)} />

      <Block d={0.25} w={0.05} shape={eCore(110)} />
      <Block d={0.27} w={0.05} shape={eCore(182)} />
      <Block d={0.26} w={0.05} shape={eCore(254)} />
      <Block d={0.24} w={0.05} shape={eCore(326)} />

      {/* HOLD C: memory array sweeps awake */}
      <Block
        d={0.54}
        w={0.07}
        shape={
          <>
            <rect x={110} y={460} width={278} height={230} rx={3} />
            {vLines(179.5, 466, 684, 69.5, 4)}
            {hLines(476, 118, 380, 16, 13)}
          </>
        }
      />

      {/* ---- right half ---- */}
      {/* HOLD B: GPU wakes first, slower bloom */}
      <Block
        d={0.36}
        w={0.08}
        shape={
          <>
            <rect x={406} y={110} width={284} height={280} rx={3} />
            {vLines(429, 118, 382, 23.7, 11)}
            <line x1={412} y1={203} x2={684} y2={203} />
            <line x1={412} y1={297} x2={684} y2={297} />
            {gpuCells}
          </>
        }
      />

      {/* small logic blocks pop scattered: right, left, wide */}
      <Block
        d={0.435}
        shape={
          <>
            <rect x={406} y={406} width={134} height={74} rx={3} />
            <rect className="chip-cell" x={416} y={416} width={50} height={24} rx={2} />
            <rect className="chip-cell" x={476} y={416} width={50} height={24} rx={2} />
            <line x1={414} y1={452} x2={532} y2={452} />
          </>
        }
      />
      <Block
        d={0.41}
        shape={
          <>
            <rect x={550} y={406} width={140} height={74} rx={3} />
            {vLines(585, 414, 472, 35, 3)}
            <rect className="chip-cell" x={558} y={438} width={20} height={28} rx={2} />
          </>
        }
      />
      <Block
        d={0.46}
        shape={
          <>
            <rect x={406} y={490} width={284} height={70} rx={3} />
            {[420, 475, 530, 585, 640].map((x) => (
              <rect key={x} className="chip-cell" x={x} y={502} width={36} height={26} rx={2} />
            ))}
            <line x1={414} y1={545} x2={682} y2={545} />
          </>
        }
      />

      {/* bottom-right striped block: second beat of HOLD C */}
      <Block
        d={0.57}
        w={0.06}
        shape={
          <>
            <rect x={406} y={575} width={284} height={115} rx={3} />
            {hLines(588, 414, 682, 13, 8)}
            <rect className="chip-cell" x={430} y={600} width={60} height={40} rx={2} />
            <rect className="chip-cell" x={600} y={610} width={50} height={30} rx={2} />
          </>
        }
      />

      {/* ---- pathways: grey pipes that fill like fluid ----
          Each line starts AT its source block and flows outward the
          beat after that block lights. The long fabric runs complete
          during the bird's-eye freeze (p 0.68-1). */}
      <g className="chip-traces">
        {/* HOLD A: lines spill out of each core as it lights (1-3-2-4) */}
        <Trace d="M 141 300 V 375" td={0.18} tw={0.09} color={CYAN} />
        <Trace d="M 285 305 V 370" td={0.2} tw={0.09} color={BLUE} />
        <Trace d="M 213 290 V 380" td={0.22} tw={0.09} color={CYAN} />
        <Trace d="M 357 295 V 385" td={0.24} tw={0.09} color={VIOLET} />

        {/* HOLD B: GPU reaches back to the cores, then down into logic */}
        <Trace d="M 440 160 H 360" td={0.39} tw={0.08} color={CYAN} />
        <Trace d="M 440 240 H 360" td={0.41} tw={0.08} color={BLUE} />
        <Trace d="M 460 350 V 440" td={0.42} tw={0.08} color={CYAN} />
        <Trace d="M 520 360 V 430" td={0.435} tw={0.08} color={BLUE} />
        <Trace d="M 580 340 V 445" td={0.45} tw={0.08} color={VIOLET} />
        <Trace d="M 640 355 V 435" td={0.46} tw={0.08} color={CYAN} />

        {/* HOLD C: memory reaches up to the e-cores, IO reaches up to logic */}
        <Trace d="M 141 480 V 425" td={0.56} tw={0.08} color={BLUE} />
        <Trace d="M 213 495 V 415" td={0.57} tw={0.08} color={CYAN} />
        <Trace d="M 285 475 V 430" td={0.585} tw={0.08} color={VIOLET} />
        <Trace d="M 357 500 V 420" td={0.6} tw={0.08} color={BLUE} />
        <Trace d="M 450 600 V 540" td={0.585} tw={0.08} color={BLUE} />
        <Trace d="M 540 595 V 545" td={0.6} tw={0.08} color={CYAN} />
        <Trace d="M 620 605 V 540" td={0.615} tw={0.08} color={VIOLET} />

        {/* FINALE (long bird's-eye freeze): the fabric stitches together */}
        <Trace d="M 397 120 V 685" td={0.68} tw={0.16} color={RED} />
        <Trace d="M 118 337.5 H 380" td={0.7} tw={0.14} color={VIOLET} />
        <Trace d="M 412 398 H 684" td={0.72} tw={0.14} color={CYAN} />
        <Trace d="M 118 452.5 H 380" td={0.74} tw={0.14} color={CYAN} />
        <Trace d="M 412 567.5 H 684" td={0.76} tw={0.14} color={BLUE} />
        <Trace d="M 240 337.5 H 397 V 398 H 430" td={0.71} tw={0.15} color={CYAN} />
        <Trace d="M 300 452.5 H 397 V 567.5 H 440" td={0.75} tw={0.15} color={BLUE} />
        <Trace d="M 397 500 H 450" td={0.78} tw={0.11} color={VIOLET} />
        <Trace d="M 232 415 V 490" td={0.77} tw={0.1} color={VIOLET} />
        <Trace d="M 304 295 V 380" td={0.79} tw={0.1} color={BLUE} />
        <Trace d="M 550 345 V 440" td={0.8} tw={0.1} color={CYAN} />
        <Trace d="M 480 545 V 600" td={0.82} tw={0.1} color={BLUE} />

        {/* edge taps land last */}
        <Trace d="M 110 200 H 74" td={0.84} tw={0.1} color={RED} />
        <Trace d="M 690 230 H 726" td={0.85} tw={0.1} color={CYAN} />
        <Trace d="M 180 690 V 726" td={0.86} tw={0.1} color={BLUE} />
        <Trace d="M 540 690 V 726" td={0.87} tw={0.1} color={VIOLET} />
        <Trace d="M 110 600 H 74" td={0.88} tw={0.1} color={CYAN} />
        <Trace d="M 690 620 H 726" td={0.89} tw={0.1} color={BLUE} />
        <Trace d="M 250 110 V 74" td={0.9} tw={0.1} color={VIOLET} />
        <Trace d="M 480 110 V 74" td={0.91} tw={0.09} color={CYAN} />
      </g>
    </svg>
  );
}
