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
  blocks.push({ x: cx0, y: 384, w: 396 - cx0, h: 32, kind: "l2", t: 0.14 });
  blocks.push({ x: 404, y: 384, w: cx1 - 404, h: 32, kind: "l2", t: 0.18 });

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
  sm: { base: (j: number) => `hsl(${220 + j * 6} 10% ${19 + j * 3}%)`, glow: "#ffd9d9" },
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
  c.globalAlpha = glow ? 0.55 : 1;
  c.fillRect(x, y, w, h);
  c.globalAlpha = 1;

  // internal texture: register files / banks / lanes
  c.strokeStyle = glow ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.12)";
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
        c.fillStyle = glow ? "#ffffff" : "hsl(0 40% 38%)";
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
    const vertical = b.kind === "phy";
    const n = Math.floor((vertical ? h : w) / 9);
    for (let i = 1; i < n; i++) {
      c.beginPath();
      if (vertical) {
        c.moveTo(x + 3, y + (h * i) / n);
        c.lineTo(x + w - 3, y + (h * i) / n);
      } else {
        c.moveTo(x + (w * i) / n, y + 3);
        c.lineTo(x + (w * i) / n, y + h - 3);
      }
      c.stroke();
    }
  }
}

export function dieTextures() {
  const blocks = dieLayout();
  const [base, b] = canvas(S);
  const [glow, g] = canvas(S);
  const [timing, t] = canvas(S);

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
  b.strokeStyle = "rgba(214,140,92,0.35)";
  b.lineWidth = 2;
  [400 * k].forEach((x) => {
    b.beginPath();
    b.moveTo(x, 120 * k);
    b.lineTo(x, 680 * k);
    b.stroke();
  });

  blocks.forEach((blk, i) => {
    drawBlock(b, blk, "base", i);
    drawBlock(g, blk, "glow", i);
    drawBlock(t, blk, "timing", i);
  });

  // seal ring
  b.strokeStyle = "#5a5a62";
  b.lineWidth = 6;
  b.strokeRect(74 * k, 74 * k, 652 * k, 652 * k);

  return { base, glow, timing };
}

/* ---- PCB ----------------------------------------------------------- */

export function pcbTexture() {
  const [c, x] = canvas(1024, 788);
  x.fillStyle = "#1f2a25";
  x.fillRect(0, 0, c.width, c.height);
  // traces under the solder mask: lighter green
  x.strokeStyle = "rgba(150,180,160,0.16)";
  x.lineWidth = 2;
  for (let i = 0; i < 70; i++) {
    const y = 40 + ((i * 53) % (c.height - 80));
    const x0 = (i * 97) % 300;
    x.beginPath();
    x.moveTo(x0, y);
    x.lineTo(x0 + 160 + (i % 5) * 40, y);
    x.lineTo(x0 + 200 + (i % 5) * 40, y + ((i % 2) ? 40 : -40));
    x.lineTo(c.width - ((i * 61) % 260), y + ((i % 2) ? 40 : -40));
    x.stroke();
  }
  // silkscreen
  x.strokeStyle = "rgba(240,240,230,0.7)";
  x.fillStyle = "rgba(240,240,230,0.75)";
  x.lineWidth = 2;
  x.strokeRect(300, 180, 424, 428);
  x.font = "bold 22px monospace";
  x.fillText("GPU", 312, 172);
  x.fillText("UWHPC-01", 40, 60);
  for (let i = 0; i < 14; i++) {
    x.strokeRect(70 + i * 64, 18, 44, 30);
    x.strokeRect(70 + i * 64, c.height - 48, 44, 30);
  }
  return c;
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
