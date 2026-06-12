import type { CSSProperties, ReactNode } from "react";

/**
 * Dense M1-style die floorplan for the scroll hero. Everything is
 * faintly outlined in grey from the start; blocks tint ember-red as
 * `--p` passes their `--d` offset, and the grey pathways fill with
 * glowing color ("fluid") as `--p` passes their `--td` offset.
 * Styling lives in globals.css under "Chip hero".
 */

function varStyle(vars: Record<string, string | number>) {
  return vars as CSSProperties;
}

/** Renders the same geometry twice: a dim grey base and a lit overlay. */
function Block({ d, shape }: { d: number; shape: ReactNode }) {
  return (
    <g className="chip-block" style={varStyle({ "--d": d })}>
      <g className="chip-block-base">{shape}</g>
      <g className="chip-block-lit">{shape}</g>
    </g>
  );
}

function Trace({ d, td, color }: { d: string; td: number; color: string }) {
  return (
    <g className="chip-trace-group" style={varStyle({ "--td": td, "--tc": color })}>
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

      {/* ---- left half ---- */}
      {/* performance cores */}
      <Block d={0.26} shape={pCore(110)} />
      <Block d={0.29} shape={pCore(182)} />
      <Block d={0.32} shape={pCore(254)} />
      <Block d={0.35} shape={pCore(326)} />

      {/* efficiency cores */}
      <Block d={0.38} shape={eCore(110)} />
      <Block d={0.4} shape={eCore(182)} />
      <Block d={0.42} shape={eCore(254)} />
      <Block d={0.44} shape={eCore(326)} />

      {/* memory array: dense striped grid */}
      <Block
        d={0.5}
        shape={
          <>
            <rect x={110} y={460} width={278} height={230} rx={3} />
            {vLines(179.5, 466, 684, 69.5, 4)}
            {hLines(476, 118, 380, 16, 13)}
          </>
        }
      />

      {/* ---- right half ---- */}
      {/* GPU: tall columns with slot bands */}
      <Block
        d={0.42}
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

      {/* small logic blocks */}
      <Block
        d={0.52}
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
        d={0.55}
        shape={
          <>
            <rect x={550} y={406} width={140} height={74} rx={3} />
            {vLines(585, 414, 472, 35, 3)}
            <rect className="chip-cell" x={558} y={438} width={20} height={28} rx={2} />
          </>
        }
      />
      <Block
        d={0.58}
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

      {/* bottom-right striped block */}
      <Block
        d={0.62}
        shape={
          <>
            <rect x={406} y={575} width={284} height={115} rx={3} />
            {hLines(588, 414, 682, 13, 8)}
            <rect className="chip-cell" x={430} y={600} width={60} height={40} rx={2} />
            <rect className="chip-cell" x={600} y={610} width={50} height={30} rx={2} />
          </>
        }
      />

      {/* ---- pathways: grey lines that fill like fluid ---- */}
      <g className="chip-traces">
        {/* central spine first */}
        <Trace d="M 397 120 V 685" td={0.35} color={RED} />

        {/* p-cores -> e-cores */}
        <Trace d="M 141 300 V 375" td={0.36} color={CYAN} />
        <Trace d="M 213 290 V 380" td={0.4} color={BLUE} />
        <Trace d="M 285 305 V 370" td={0.44} color={CYAN} />
        <Trace d="M 357 295 V 385" td={0.48} color={VIOLET} />

        {/* e-cores -> memory array */}
        <Trace d="M 141 425 V 480" td={0.52} color={BLUE} />
        <Trace d="M 213 415 V 495" td={0.56} color={CYAN} />
        <Trace d="M 285 430 V 475" td={0.6} color={VIOLET} />
        <Trace d="M 357 420 V 500" td={0.64} color={BLUE} />

        {/* channel runs */}
        <Trace d="M 118 337.5 H 380" td={0.41} color={VIOLET} />
        <Trace d="M 118 452.5 H 380" td={0.49} color={CYAN} />
        <Trace d="M 412 398 H 684" td={0.53} color={CYAN} />
        <Trace d="M 412 567.5 H 684" td={0.68} color={BLUE} />

        {/* left <-> spine <-> right */}
        <Trace d="M 240 337.5 H 397 V 398 H 430" td={0.38} color={CYAN} />
        <Trace d="M 300 452.5 H 397 V 567.5 H 440" td={0.5} color={BLUE} />
        <Trace d="M 360 160 H 440" td={0.42} color={CYAN} />
        <Trace d="M 360 240 H 440" td={0.46} color={BLUE} />
        <Trace d="M 397 500 H 450" td={0.58} color={VIOLET} />

        {/* GPU -> small blocks */}
        <Trace d="M 460 350 V 440" td={0.47} color={CYAN} />
        <Trace d="M 520 360 V 430" td={0.51} color={BLUE} />
        <Trace d="M 580 340 V 445" td={0.55} color={VIOLET} />
        <Trace d="M 640 355 V 435" td={0.59} color={CYAN} />

        {/* small blocks -> bottom-right */}
        <Trace d="M 450 540 V 600" td={0.62} color={BLUE} />
        <Trace d="M 540 545 V 595" td={0.66} color={CYAN} />
        <Trace d="M 620 540 V 605" td={0.7} color={VIOLET} />

        {/* edge taps */}
        <Trace d="M 110 200 H 74" td={0.72} color={RED} />
        <Trace d="M 690 230 H 726" td={0.74} color={CYAN} />
        <Trace d="M 180 690 V 726" td={0.76} color={BLUE} />
        <Trace d="M 540 690 V 726" td={0.78} color={VIOLET} />
        <Trace d="M 110 600 H 74" td={0.8} color={CYAN} />
        <Trace d="M 690 620 H 726" td={0.82} color={BLUE} />
      </g>
    </svg>
  );
}
