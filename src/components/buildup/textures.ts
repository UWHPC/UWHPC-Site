/**
 * Canvas textures for the build-up hero (procedural; no image files).
 *
 * The die is drawn three times on one layout (GH100: 8 GPCs x 18 SMs,
 * L2 band, HBM PHYs, IO):
 *   - base:   clay-toned floorplan, desaturated to sit with matte models;
 *   - glow:   bright versions of the same blocks for the emissive map;
 *   - timing: greyscale, each block's value = the die-progress at which it
 *             powers on. The die material gates its glow with this map.
 * All 144 SMs light: the readout names the full die.
 */

type Ctx = CanvasRenderingContext2D;

function canvas(w: number, h = w): [HTMLCanvasElement, Ctx] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d") as Ctx];
}

/* ---- die ----------------------------------------------------------- */

const S = 1024;
const k = S / 800; // layout below is in an 800 box, as in the SVG die
export const DIE_WIDTH = 26;

type Block = { x: number; y: number; w: number; h: number; kind: "sm" | "l2" | "phy" | "io"; t: number };

function dieLayout(): Block[] {
  const blocks: Block[] = [];
  const IN = 84;
  const OUT = 716;
  const SIDE = 40;
  const IO = 30;
  const cx0 = IN + SIDE + 12;
  const cx1 = OUT - SIDE - 12;
  const gpcGap = 10;
  const gpcW = (cx1 - cx0 - 3 * gpcGap) / 4;
  const halves = [
    { y0: IN + IO + 12, y1: 374 },
    { y0: 426, y1: OUT - IO - 12 },
  ];
  const order = [1, 2, 0, 3];

  // PCIe, then L2, then GPCs centre-out, then HBM PHYs, then NVLink
  blocks.push({ x: cx0 + 150, y: OUT - IO, w: cx1 - cx0 - 300, h: IO, kind: "io", t: 0.06 });
  blocks.push({ x: cx0, y: 384, w: 357 - cx0, h: 32, kind: "l2", t: 0.14 });
  blocks.push({ x: 443, y: 384, w: cx1 - 443, h: 32, kind: "l2", t: 0.18 });

  // GH100: 8 GPCs of 18 SMs (9 TPCs x 2), all 144 shown lit.
  order.forEach((c, i) => {
    const gx = cx0 + c * (gpcW + gpcGap);
    halves.forEach((h, j) => {
      const pad = 5;
      const strip = 10;
      const cols = 3;
      const rows = 6;
      const smW = (gpcW - pad * 2 - (cols - 1) * 3) / cols;
      const smH = (h.y1 - h.y0 - pad * 2 - strip - 4 - (rows - 1) * 3) / rows;
      const t = 0.26 + i * 0.09 + j * 0.03;
      for (let r = 0; r < rows; r++) {
        for (let q = 0; q < cols; q++) {
          blocks.push({
            x: gx + pad + q * (smW + 3),
            y: h.y0 + pad + strip + 4 + r * (smH + 3),
            w: smW,
            h: smH,
            kind: "sm",
            t: t + r * 0.01 + q * 0.005,
          });
        }
      }
    });
  });

  for (let i = 0; i < 3; i++) {
    const h = (OUT - IN - 24) / 3;
    const y = IN + 6 + i * (h + 6);
    blocks.push({ x: IN, y, w: SIDE, h, kind: "phy", t: 0.68 + i * 0.04 });
    blocks.push({ x: OUT - SIDE, y, w: SIDE, h, kind: "phy", t: 0.7 + i * 0.04 });
  }
  blocks.push({ x: cx0, y: IN, w: cx1 - cx0, h: IO, kind: "io", t: 0.82 });
  blocks.push({ x: cx0, y: OUT - IO, w: 140, h: IO, kind: "io", t: 0.86 });
  blocks.push({ x: cx1 - 140, y: OUT - IO, w: 140, h: IO, kind: "io", t: 0.86 });
  return blocks;
}

const PALETTE = {
  sm: { base: (j: number) => `hsl(${220 + j * 6} 10% ${19 + j * 3}%)`, glow: "#bf777c" },
  l2: { base: () => "hsl(0 22% 24%)", glow: "#ff6b6e" },
  phy: { base: () => "hsl(30 14% 26%)", glow: "#ffb2a8" },
  io: { base: () => "hsl(220 8% 22%)", glow: "#e0494d" },
};

function drawBlock(c: Ctx, b: Block, mode: "base" | "glow" | "timing", seed: number) {
  const x = b.x * k;
  const y = b.y * k;
  const w = b.w * k;
  const h = b.h * k;
  if (mode === "timing") {
    const v = Math.round(b.t * 255);
    c.fillStyle = `rgb(${v},${v},${v})`;
    c.fillRect(x, y, w, h);
    return;
  }
  const glow = mode === "glow";
  c.fillStyle = glow ? PALETTE[b.kind].glow : PALETTE[b.kind].base(seed % 3);
  c.globalAlpha = glow ? 0.4 : 1;
  c.fillRect(x, y, w, h);
  c.globalAlpha = 1;

  // internal texture: register files / banks / lanes
  c.strokeStyle = glow ? "rgba(255,230,226,0.52)" : "rgba(255,255,255,0.12)";
  c.lineWidth = 1;
  if (b.kind === "sm") {
    // four sub-partitions, each with a tensor-core cell
    const qw = (w - 6) / 2;
    const qh = (h - 10) / 2;
    for (let r = 0; r < 2; r++) {
      for (let q = 0; q < 2; q++) {
        const sx = x + 2 + q * (qw + 2);
        const sy = y + 2 + r * (qh + 2);
        c.strokeRect(sx, sy, qw, qh);
        c.fillStyle = glow ? "#ffd3ca" : "hsl(0 40% 38%)";
        c.fillRect(sx + qw * 0.55, sy + qh * 0.2, qw * 0.35, qh * 0.55);
        for (let l = 1; l < 4; l++) {
          c.beginPath();
          c.moveTo(sx + 2, sy + (qh * l) / 4);
          c.lineTo(sx + qw * 0.5, sy + (qh * l) / 4);
          c.stroke();
        }
      }
    }
    c.fillStyle = glow ? "rgba(255,255,255,0.6)" : "hsl(205 30% 40%)";
    c.fillRect(x + 2, y + h - 5, w - 4, 3);
  } else {
    const phy = b.kind === "phy";
    const n = Math.floor((phy ? h : w) / 9);
    c.fillStyle = glow ? "rgba(255,179,165,0.48)" : "rgba(197,174,141,0.25)";
    for (let i = 1; i < n; i++) {
      c.beginPath();
      if (phy) {
        const lane = y + (h * i) / n;
        c.moveTo(x + 4, lane - 2);
        c.lineTo(x + w - 10, lane - 2);
        c.moveTo(x + 4, lane + 2);
        c.lineTo(x + w - 10, lane + 2);
        c.fillRect(x + w - 8, lane - 3, 4, 6);
      } else if (b.kind === "l2") {
        const bank = x + (w * i) / n;
        c.moveTo(bank, y + 3);
        c.lineTo(bank, y + h * 0.43);
        c.moveTo(bank, y + h * 0.57);
        c.lineTo(bank, y + h - 3);
      } else {
        const pin = x + (w * i) / n;
        c.moveTo(pin, y + h * 0.33);
        c.lineTo(pin, y + h - 7);
        c.fillRect(pin - 2, y + 4, 4, 5);
      }
      c.stroke();
    }
  }
}

export function dieTextures(resolution: number) {
  const blocks = dieLayout();
  const [base, b] = canvas(resolution);
  const [glow, g] = canvas(resolution);
  const [timing, t] = canvas(S);
  const scale = resolution / S;
  b.scale(scale, scale);
  g.scale(scale, scale);

  // silicon: deep indigo with a faint diagonal sheen
  const grad = b.createLinearGradient(0, 0, S, S);
  grad.addColorStop(0, "#1c1c22");
  grad.addColorStop(0.5, "#17171c");
  grad.addColorStop(1, "#1d1a1e");
  b.fillStyle = grad;
  b.fillRect(0, 0, S, S);
  g.fillStyle = "#000";
  g.fillRect(0, 0, S, S);
  t.fillStyle = "#fff";
  t.fillRect(0, 0, S, S);

  // routing channels between blocks: copper-ish hairlines
  b.strokeStyle = "rgba(214,158,110,0.33)";
  b.lineWidth = 1;
  for (let lane = 0; lane < 5; lane++) {
    const x = (396 + 2 * lane) * k;
    b.beginPath();
    b.moveTo(x, 120 * k);
    b.lineTo(x, 680 * k);
    b.stroke();
  }
  for (let lane = 0; lane < 3; lane++) {
    for (const y of [378 + 1.5 * lane, 419 + 1.5 * lane]) {
      b.beginPath();
      b.moveTo(132 * k, y * k);
      b.lineTo(668 * k, y * k);
      b.stroke();
    }
  }

  blocks.forEach((blk, i) => {
    drawBlock(b, blk, "base", i);
    drawBlock(g, blk, "glow", i);
    drawBlock(t, blk, "timing", i);
  });

  // seal ring
  b.strokeStyle = "#5a5a62";
  b.lineWidth = 6;
  b.strokeRect(74 * k, 74 * k, 652 * k, 652 * k);
  b.lineWidth = 1;
  b.strokeStyle = "#747782";
  b.strokeRect(65 * k, 65 * k, 670 * k, 670 * k);
  b.fillStyle = "#777b89";
  for (let i = 0; i < 92; i++) {
    const pos = (76 + i * 7.1) * k;
    b.fillRect(pos, 56 * k, 2 * k, 4 * k);
    b.fillRect(pos, 740 * k, 2 * k, 4 * k);
    b.fillRect(56 * k, pos, 4 * k, 2 * k);
    b.fillRect(740 * k, pos, 4 * k, 2 * k);
  }
  b.font = "bold 13px monospace";
  b.fillText("GH100", 78 * k, 49 * k);
  b.font = "9px monospace";
  b.fillText("DIE 01", 690 * k, 49 * k);

  return { base, glow, timing };
}

/* ---- PCB ----------------------------------------------------------- */

type PcbLayout = {
  width: number;
  length: number;
  boardZ: number;
  powerStages: [number, number][];
  controllers: [number, number][];
  bulkX: number[];
  bulkZ: number;
};

export function pcbTexture({ width, length, boardZ, powerStages, controllers, bulkX, bulkZ }: PcbLayout) {
  const [c, x] = canvas(768, 1848);
  const mask = x.createLinearGradient(0, 0, c.width, c.height);
  mask.addColorStop(0, "#20302a");
  mask.addColorStop(0.5, "#263b32");
  mask.addColorStop(1, "#1c2a25");
  x.fillStyle = mask;
  x.fillRect(0, 0, c.width, c.height);
  // The top-face UVs run along x and z, so the artwork can use card millimetres.
  x.translate(c.width / 2, c.height / 2);
  x.scale(c.width / width, c.height / length);
  x.translate(0, -boardZ);

  const trace = (points: [number, number][]) => {
    x.beginPath();
    x.moveTo(...points[0]);
    points.slice(1).forEach((point) => x.lineTo(...point));
    x.stroke();
  };
  const via = (u: number, z: number, radius = 0.44) => {
    x.beginPath();
    x.arc(u, z, radius, 0, 2 * Math.PI);
    x.fillStyle = "#8a8563";
    x.fill();
    x.beginPath();
    x.arc(u, z, radius * 0.48, 0, 2 * Math.PI);
    x.fillStyle = "#17231f";
    x.fill();
  };

  // Power rails and short branches from each regulator stage.
  x.lineWidth = 0.8;
  x.strokeStyle = "#456052";
  // Fan the rear power connector out into the two regulator rails.
  const connectorZ = boardZ - 126;
  for (let pin = 0; pin < 4; pin++) {
    const z = connectorZ + 7 + pin * 2;
    trace([[24 + pin * 3, connectorZ + 4], [24 + pin * 3, z], [43 + pin * 2, z], [49.5, z + 6]]);
    trace([[20, connectorZ - 2 - pin * 1.2], [-38, connectorZ - 2 - pin * 1.2], [-49.5, connectorZ + 9.5 - pin * 1.2]]);
  }
  for (const side of [-1, 1]) {
    trace([[side * 49.5, boardZ - 127], [side * 49.5, boardZ + 113]]);
    trace([[side * 51, boardZ - 126], [side * 51, boardZ + 111]]);
  }
  powerStages.forEach(([u, z]) => {
    const side = Math.sign(u);
    trace([[side * 49.5, z - 2.6], [u, z - 2.6], [u - side * 6, z]]);
    trace([[u - side * 6, z + 1.1], [side * 33, z + 1.1], [side * 29.4, z + 4.7]]);
    via(side * 29.4, z + 4.7);
  });

  // Parallel signals fan out from the package toward the connectors.
  x.lineWidth = 0.27;
  x.strokeStyle = "#698076";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 14; i++) {
      const start = -22 + i * 1.28;
      const jog = 43 + i * 1.7;
      const end = 72 + i * 1.35;
      trace([[start, side * 29], [start, side * jog], [start - 7, side * (jog + 7)], [start - 7, side * end]]);
      via(start - 7, side * end, 0.37);
    }
    for (let i = 0; i < 15; i++) {
      const z = -23 + i * 2.75;
      trace([[side * 29, z], [side * 35, z], [side * 44, z + 9], [side * 51.6, z + 9]]);
      via(side * 51.6, z + 9, 0.34);
    }
  }
  for (const [u, z] of [[-34, 95], [33, 84], [-34, -107], [5, -119]]) {
    for (let i = 0; i < 15; i++) via(u + (i % 5) * 1.9, z + Math.floor(i / 5) * 1.9);
  }

  // Silkscreen is registered to the component footprints.
  x.strokeStyle = "#a2aba2";
  x.fillStyle = "#bbc1b5";
  x.lineWidth = 0.32;
  x.strokeRect(-31, -31, 62, 62);
  x.font = "2.35px monospace";
  x.fillText("U1", -30.5, -32);
  powerStages.forEach(([u, z], i) => {
    x.strokeRect(u - 4.3, z - 4.3, 8.6, 8.6);
    x.fillText(`L${101 + i}`, Math.sign(u) * 42 - 2.5, z + 4.75);
  });
  controllers.forEach(([u, z], i) => {
    x.strokeRect(u - 5.5, z - 4.4, 11, 8.8);
    x.fillText(`U${i + 2}`, u - 5.3, z - 5.2);
  });
  bulkX.forEach((u, i) => {
    x.beginPath();
    x.arc(u, bulkZ, 3.35, 0, 2 * Math.PI);
    x.stroke();
    x.fillText(`C${101 + i}`, u - 2.7, bulkZ + 5.65);
  });
  x.fillText("J1", 19, boardZ - 119);
  x.fillText("PCIE", -49, 59);
  x.fillText("NVLINK", 40, 32);
  x.font = "bold 5px monospace";
  x.fillText("UWHPC", -7, 86);
  return c;
}

/** Fine directional grain and the inset seam on the copper chamber. */
export function vapourChamberTexture() {
  const [surface, ctx] = canvas(512);
  ctx.fillStyle = "#efeeec";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 512; i++) {
    const start = (i * 179) % 512;
    const width = 82 + (i * 43) % 390;
    ctx.fillStyle = i % 3 === 0 ? "rgba(255,255,255,0.27)" : "rgba(68,53,42,0.075)";
    ctx.fillRect(start, i, width, 1);
    ctx.fillRect(start - 512, i, width, 1);
  }
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(85,65,52,0.2)";
  ctx.beginPath();
  ctx.roundRect(14, 14, 484, 484, 15);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.42)";
  ctx.beginPath();
  ctx.roundRect(17, 17, 478, 478, 13);
  ctx.stroke();
  return surface;
}

/* ---- datacentre floor ---------------------------------------------- */

/**
 * A soft contact shadow: dark in the middle, fading to nothing at the
 * edge, with a faint lighter ring so objects read as resting on a floor
 * rather than floating in the dark.
 */
export function shadowTexture(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  r.addColorStop(0, "rgba(0,0,0,0.7)");
  r.addColorStop(0.3, "rgba(0,0,0,0.42)");
  r.addColorStop(0.52, "rgba(0,0,0,0.08)");
  r.addColorStop(0.62, "rgba(255,255,255,0.006)");
  r.addColorStop(0.78, "rgba(255,255,255,0.012)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  return c;
}
