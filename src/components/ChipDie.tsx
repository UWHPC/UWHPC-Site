import type { CSSProperties, ReactNode } from "react";

/**
 * M4-style die floorplan for the scroll hero: wall-to-wall pattern
 * density, every region with its own texture. All geometry renders
 * twice — a dim grey skeleton and an ember-red lit overlay whose timing
 * metadata is consumed by useScrollProgress.
 * Styling: globals.css "Chip hero".
 *
 * Timeline (one continuous camera swoop, p 0.05-0.70):
 *   0.04+   the die edge sweeps most of the way around, alone
 *   0.22+   badge, then cores crisscross, streets flood behind them
 *   0.42+   GPU blooms, SRAM macros scatter
 *   0.56+   media/memory/bricks sweep
 *   0.64+   bird's-eye freeze: channels flood, moat closes, title eases in
 *   0.89+   everything settled — still dwell to the end of the runway
 */

function varStyle(vars: Record<string, string | number>) {
  return vars as CSSProperties;
}

type Region = {
  d: number;
  w?: number;
  shape: ReactNode;
};

type Gap = {
  d: string;
  td: number;
  tw?: number;
  sw?: number;
  color: string;
};

function gapStyle(item: Gap) {
  return varStyle({
    "--tc": item.color,
    ...(item.sw ? { "--sw": item.sw } : {}),
    "--chip-range-start": `${item.td * 100}%`,
    "--chip-range-end": `${(item.td + (item.tw ?? 0.12)) * 100}%`,
  });
}

function regionStyle(item: Region) {
  return varStyle({
    "--chip-range-start": `${item.d * 100}%`,
    "--chip-range-end": `${(item.d + (item.w ?? 0.08)) * 100}%`,
  });
}

const COPPER = "#dd6e4f";

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

/** Badge block: the UWHPC chip mark as dense line art (no text). */
function badgeShape() {
  return (
    <>
      {/* outer frame */}
      <rect x={84} y={84} width={288} height={124} rx={4} />

      {/* corner fiducials */}
      <rect className="chip-cell" x={88} y={88} width={7} height={7} />
      <rect className="chip-cell" x={357} y={88} width={7} height={7} />
      <rect className="chip-cell" x={88} y={201} width={7} height={7} />
      <rect className="chip-cell" x={357} y={201} width={7} height={7} />

      {/* left control block */}
      <rect x={92} y={96} width={54} height={96} rx={2} />
      <rect className="chip-cell" x={96} y={100} width={46} height={14} rx={1} />
      {[118, 129, 140, 151, 162, 173].map((y) => (
        <rect key={y} className="chip-cell" x={96} y={y} width={46} height={7} rx={1} />
      ))}

      {/* routing channels: three horizontal buses */}
      <line x1={146} y1={122} x2={238} y2={122} />
      <line x1={122} y1={146} x2={238} y2={146} />
      <line x1={146} y1={170} x2={238} y2={170} />

      {/* branch stubs off the buses */}
      <line x1={172} y1={100} x2={172} y2={122} />
      <line x1={192} y1={100} x2={192} y2={122} />
      <line x1={212} y1={100} x2={212} y2={122} />
      <line x1={162} y1={170} x2={162} y2={192} />
      <line x1={184} y1={170} x2={184} y2={192} />
      <line x1={206} y1={170} x2={206} y2={192} />
      <line x1={158} y1={122} x2={158} y2={170} />
      <line x1={224} y1={122} x2={224} y2={170} />


      {/* chip package */}
      <rect x={240} y={96} width={112} height={96} rx={6} />
      <rect className="chip-cell" x={247} y={103} width={98} height={82} rx={4} />

      {/* package pads */}
      {[256, 272, 288, 304, 320, 336].map((x) => (
        <g key={`tp${x}`}>
          <line x1={x} y1={96} x2={x} y2={84} />
          <line x1={x - 4} y1={84} x2={x + 4} y2={84} />
        </g>
      ))}
      {[256, 272, 288, 304, 320, 336].map((x) => (
        <g key={`bp${x}`}>
          <line x1={x} y1={192} x2={x} y2={204} />
          <line x1={x - 4} y1={204} x2={x + 4} y2={204} />
        </g>
      ))}
      {[112, 128, 144, 160, 176].map((y) => (
        <rect key={`lp${y}`} className="chip-cell" x={240} y={y} width={7} height={9} rx={1} />
      ))}
      {[112, 128, 144, 160, 176].map((y) => (
        <rect key={`rp${y}`} className="chip-cell" x={345} y={y} width={7} height={9} rx={1} />
      ))}

      {/* inset die and macro cells */}
      <rect className="chip-cell" x={256} y={112} width={80} height={62} rx={3} />
      <rect className="chip-cell" x={262} y={118} width={29} height={20} rx={1} />
      <rect className="chip-cell" x={301} y={118} width={29} height={20} rx={1} />
      <rect className="chip-cell" x={262} y={148} width={29} height={20} rx={1} />
      <rect className="chip-cell" x={301} y={148} width={29} height={20} rx={1} />

      {/* central buses and routing channels */}
      <line x1={256} y1={143} x2={336} y2={143} />
      <line x1={296} y1={112} x2={296} y2={174} />
      <line x1={291} y1={128} x2={301} y2={128} />
      <line x1={291} y1={158} x2={301} y2={158} />
      <line x1={276} y1={138} x2={276} y2={148} />
      <line x1={316} y1={138} x2={316} y2={148} />
      <line x1={247} y1={143} x2={256} y2={143} />
      <line x1={336} y1={143} x2={345} y2={143} />

      {/* dense local routing */}
      {vLines(268, 122, 134, 6, 3)}
      {hLines(123, 306, 326, 6, 3)}
      {hLines(153, 267, 287, 6, 3)}
      {[307, 318].map((x) => (
        <rect key={`via${x}`} className="chip-cell" x={x} y={153} width={6} height={6} rx={1} />
      ))}
      {[267, 278].map((x) => (
        <rect key={`via-b${x}`} className="chip-cell" x={x} y={161} width={6} height={6} rx={1} />
      ))}
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

  const regions: Region[] = [
    { d: 0.22, w: 0.1, shape: badgeShape() },
    { d: 0.26, shape: pCoreShape(84) },
    { d: 0.3, shape: pCoreShape(158) },
    { d: 0.28, shape: pCoreShape(232) },
    { d: 0.32, shape: pCoreShape(306) },
    { d: 0.34, w: 0.06, shape: eUnitShape(84, 506) },
    { d: 0.36, w: 0.06, shape: eUnitShape(182, 506) },
    { d: 0.38, w: 0.06, shape: eUnitShape(280, 506) },
    { d: 0.37, w: 0.06, shape: eUnitShape(84, 561) },
    { d: 0.35, w: 0.06, shape: eUnitShape(182, 561) },
    { d: 0.39, w: 0.06, shape: eUnitShape(280, 561) },
    { d: 0.58, w: 0.09, shape: <>{memCells}</> },
    {
      d: 0.42,
      w: 0.12,
      shape: (
        <>
          <rect x={400} y={84} width={316} height={330} rx={3} />
          {gpuUnits}
        </>
      ),
    },
    { d: 0.47, shape: sramMacro(508) },
    { d: 0.49, shape: sramMacro(616) },
    { d: 0.51, shape: sramMacro(400) },
    {
      d: 0.56,
      w: 0.08,
      shape: (
        <>
          <rect x={400} y={506} width={180} height={124} rx={3} />
          <rect className="chip-cell" x={412} y={520} width={28} height={96} rx={2} />
          <rect className="chip-cell" x={540} y={520} width={28} height={96} rx={2} />
          {hLines(530, 448, 532, 11, 8)}
          <rect className="chip-cell" x={466} y={514} width={48} height={108} rx={2} />
        </>
      ),
    },
    { d: 0.595, w: 0.07, shape: <>{bricks}</> },
    {
      d: 0.615,
      w: 0.07,
      shape: (
        <>
          <rect x={400} y={636} width={150} height={80} rx={2} />
          {vLines(412, 644, 708, 14, 10)}
        </>
      ),
    },
    {
      d: 0.625,
      w: 0.07,
      shape: (
        <>
          <rect x={558} y={636} width={158} height={80} rx={2} />
          {[566, 618, 668].map((x) => (
            <rect key={x} className="chip-cell" x={x} y={648} width={40} height={26} rx={2} />
          ))}
          {hLines(684, 566, 708, 10, 3)}
        </>
      ),
    },
  ];

  const gaps: Gap[] = [
    { d: "M 84 214 H 372", td: 0.24, tw: 0.13, sw: 8, color: COPPER },
    { d: "M 154 220 V 500", td: 0.28, tw: 0.11, color: COPPER },
    { d: "M 302 220 V 500", td: 0.3, tw: 0.11, color: COPPER },
    { d: "M 228 220 V 500", td: 0.32, tw: 0.11, color: COPPER },
    { d: "M 178 506 V 610", td: 0.37, tw: 0.1, color: COPPER },
    { d: "M 276 506 V 610", td: 0.385, tw: 0.1, color: COPPER },
    { d: "M 84 558 H 372", td: 0.4, tw: 0.1, color: COPPER },
    { d: "M 400 417 H 716", td: 0.46, tw: 0.14, color: COPPER },
    { d: "M 504 420 V 500", td: 0.5, tw: 0.1, color: COPPER },
    { d: "M 612 420 V 500", td: 0.52, tw: 0.1, color: COPPER },
    { d: "M 584 506 V 630", td: 0.585, tw: 0.1, color: COPPER },
    { d: "M 652 506 V 630", td: 0.6, tw: 0.1, color: COPPER },
    { d: "M 154 616 V 716", td: 0.6, tw: 0.1, color: COPPER },
    { d: "M 228 616 V 716", td: 0.61, tw: 0.1, color: COPPER },
    { d: "M 302 616 V 716", td: 0.62, tw: 0.1, color: COPPER },
    { d: "M 554 636 V 716", td: 0.63, tw: 0.1, color: COPPER },
    { d: "M 386 84 V 716", td: 0.64, tw: 0.1, sw: 9, color: COPPER },
    { d: "M 84 503 H 372", td: 0.66, tw: 0.09, sw: 5, color: COPPER },
    { d: "M 400 503 H 716", td: 0.675, tw: 0.09, sw: 5, color: COPPER },
    { d: "M 84 613 H 372", td: 0.69, tw: 0.09, sw: 5, color: COPPER },
    { d: "M 84 666 H 372", td: 0.705, tw: 0.09, sw: 5, color: COPPER },
    { d: "M 400 633 H 716", td: 0.72, tw: 0.09, sw: 5, color: COPPER },
    {
      d: "M 84 77 H 716 A 7 7 0 0 1 723 84 V 716 A 7 7 0 0 1 716 723 H 84 A 7 7 0 0 1 77 716 V 84 A 7 7 0 0 1 84 77 Z",
      td: 0.72,
      tw: 0.11,
      sw: 8,
      color: COPPER,
    },
  ];

  return (
    <>
      <canvas
        className="chip-base-canvas chip-face"
        width={800}
        height={800}
        aria-hidden="true"
      />
      <svg
        viewBox="0 0 800 800"
        className="chip-svg chip-face"
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
      <rect className="chip-die-edge-glow" pathLength={1} x={70} y={70} width={660} height={660} rx={14} />
      <rect className="chip-die-edge" pathLength={1} x={70} y={70} width={660} height={660} rx={14} />

      {/* Keep both region layers materialized. SVG <use> reduced markup, but
          deferred instance work caused visible stalls on throttled mobile. */}
      <g className="chip-blocks-base">
        {regions.map((region, index) => (
          <g key={index} className="chip-block-base">
            {region.shape}
          </g>
        ))}
      </g>
      <g className="chip-blocks-lit">
        {regions.map((region, index) => (
          <g
            key={index}
            className="chip-block-lit"
            data-chip-start={region.d}
            data-chip-duration={region.w ?? 0.08}
            style={regionStyle(region)}
          >
            {region.shape}
          </g>
        ))}
      </g>

      {/* The base, flood, and packet layers are separated so each animated
          layer shares one effect rather than creating a filter per path. */}
      <g className="chip-traces">
        <g className="chip-traces-base">
          {gaps.map((gap, index) => (
            <path key={index} className="chip-trace-base" style={gapStyle(gap)} d={gap.d} />
          ))}
        </g>
        <g className="chip-traces-lit">
          {gaps.map((gap, index) => (
            <path
              key={index}
              className="chip-trace"
              data-chip-start={gap.td}
              data-chip-duration={gap.tw ?? 0.12}
              style={gapStyle(gap)}
              pathLength={1}
              d={gap.d}
            />
          ))}
        </g>
        <g className="chip-traces-pulses">
          {gaps.map((gap, index) => (
            <path
              key={index}
              className="chip-trace-pulse"
              data-chip-start={gap.td}
              data-chip-duration={gap.tw ?? 0.12}
              style={gapStyle(gap)}
              pathLength={1}
              d={gap.d}
            />
          ))}
        </g>
      </g>
      </svg>
    </>
  );
}
