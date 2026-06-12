import type { CSSProperties } from "react";

/**
 * The chip die floorplan for the scroll hero. Every visual phase is
 * driven by the `--p` custom property set on `.chip-stage`:
 *  - `.chip-block` lights up when --p passes its own `--d` offset
 *  - `.chip-trace` draws in when --p passes its `--td` offset
 *  - edge/pad glow follows the shared `--edge` phase
 * Styling lives in globals.css under "Chip hero".
 */

function varStyle(vars: Record<string, string | number>) {
  return vars as CSSProperties;
}

function Block({
  x,
  y,
  w,
  h,
  d,
  label,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  d: number;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <g className="chip-block" style={varStyle({ "--d": d })}>
      <rect className="chip-block-base" x={x} y={y} width={w} height={h} rx={6} />
      <g className="chip-block-lit">
        <rect x={x} y={y} width={w} height={h} rx={6} />
        {children}
        {label && (
          <text x={x + w - 10} y={y + h - 10} textAnchor="end">
            {label}
          </text>
        )}
      </g>
    </g>
  );
}

function Trace({ d, td, color }: { d: string; td: number; color: string }) {
  return (
    <g className="chip-trace-group" style={varStyle({ "--td": td, "--tc": color })}>
      <path className="chip-trace" pathLength={1} d={d} />
      <path className="chip-trace-pulse" pathLength={1} d={d} />
    </g>
  );
}

const CYAN = "#4cc9f0";
const BLUE = "#5a8bff";
const VIOLET = "#b15cff";

/** Core detail: a few instruction-pipeline-looking rows. */
function CoreLines({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <>
      {[0.3, 0.5, 0.7].map((f) => (
        <line key={f} x1={x + 12} y1={y + h * f} x2={x + w - 12} y2={y + h * f} />
      ))}
    </>
  );
}

export default function ChipDie() {
  const gpuCells: React.ReactNode[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      gpuCells.push(
        <rect
          key={`${r}-${c}`}
          x={444 + c * 60}
          y={124 + r * 62}
          width={52}
          height={54}
          rx={3}
          className="chip-cell"
        />
      );
    }
  }

  const memLines: React.ReactNode[] = [];
  for (let x = 134; x <= 666; x += 24) {
    memLines.push(<line key={x} x1={x} y1={622} x2={x} y2={678} />);
  }

  const padsTop: React.ReactNode[] = [];
  const padsBottom: React.ReactNode[] = [];
  const padsLeft: React.ReactNode[] = [];
  const padsRight: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const along = 118 + i * 48;
    padsTop.push(<rect key={i} x={along} y={48} width={20} height={12} rx={2} />);
    padsBottom.push(<rect key={i} x={along} y={740} width={20} height={12} rx={2} />);
    padsLeft.push(<rect key={i} x={48} y={along} width={12} height={20} rx={2} />);
    padsRight.push(<rect key={i} x={740} y={along} width={12} height={20} rx={2} />);
  }

  return (
    <svg
      viewBox="0 0 800 800"
      className="chip-svg"
      role="img"
      aria-label="Stylized processor die lighting up: cores, GPU, cache and IO blocks connected by signal traces"
    >
      <defs>
        <radialGradient id="chip-die-grad" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#1c1c1c" />
          <stop offset="100%" stopColor="#131313" />
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

      {/* blocks */}
      <Block x={110} y={110} w={125} h={95} d={0.3}>
        <CoreLines x={110} y={110} w={125} h={95} />
      </Block>
      <Block x={245} y={110} w={125} h={95} d={0.33}>
        <CoreLines x={245} y={110} w={125} h={95} />
      </Block>
      <Block x={110} y={215} w={125} h={95} d={0.36}>
        <CoreLines x={110} y={215} w={125} h={95} />
      </Block>
      <Block x={245} y={215} w={125} h={95} d={0.39} label="CPU">
        <CoreLines x={245} y={215} w={125} h={95} />
      </Block>

      <Block x={110} y={325} w={260} h={55} d={0.42} label="L2" />

      <Block x={430} y={110} w={260} h={270} d={0.45} label="GPU">
        {gpuCells}
      </Block>

      <Block x={110} y={430} w={180} h={150} d={0.5} label="NPU">
        <rect x={126} y={446} width={70} height={55} rx={3} className="chip-cell" />
        <rect x={204} y={446} width={70} height={55} rx={3} className="chip-cell" />
        <rect x={126} y={509} width={70} height={55} rx={3} className="chip-cell" />
        <rect x={204} y={509} width={70} height={55} rx={3} className="chip-cell" />
      </Block>

      <Block x={320} y={450} w={180} h={130} d={0.53} label="SLC" />

      <Block x={530} y={430} w={160} h={150} d={0.56} label="IO" />

      <Block x={110} y={610} w={580} h={80} d={0.6} label="MEM">
        {memLines}
      </Block>

      {/* signal traces, drawn in scroll order then carrying pulses */}
      <g className="chip-traces">
        <Trace d="M 370 200 H 400 V 240 H 430" td={0.46} color={CYAN} />
        <Trace d="M 370 352 H 430" td={0.5} color={BLUE} />
        <Trace d="M 290 505 H 320" td={0.54} color={CYAN} />
        <Trace d="M 350 380 V 450" td={0.58} color={BLUE} />
        <Trace d="M 560 380 V 430" td={0.62} color={VIOLET} />
        <Trace d="M 410 580 V 610" td={0.66} color={CYAN} />
        <Trace d="M 610 580 V 610" td={0.7} color={BLUE} />
        <Trace d="M 200 580 V 610" td={0.74} color={VIOLET} />
        <Trace d="M 400 280 V 400 H 470 V 450" td={0.78} color={CYAN} />
        <Trace d="M 690 300 H 728" td={0.8} color={BLUE} />
        <Trace d="M 110 160 H 72" td={0.82} color={CYAN} />
      </g>
    </svg>
  );
}
