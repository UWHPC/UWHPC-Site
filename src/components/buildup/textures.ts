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

import {
  BOARD, BULK, COOLER_MOUNTS, LABEL, NVLINK, POLYMER, STAGE, chips, footprints, nvlink, pcie, phases, polymerCaps,
  type Footprint,
} from "./models/boardLayout";


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

/**
 * The board's top face: solder mask over copper pours, via fences and
 * arrays, differential pairs from the edge connectors to the package (some
 * length-matched with serpentines), and silkscreen registered to every part
 * in boardLayout.ts — outlines, refdes, pin-1 and polarity marks, fiducials,
 * test points, the board ID and a serial label.
 */
export function pcbTexture() {
  const { width, length, centerZ } = BOARD;
  const [c, x] = canvas(1024, 2464);
  const mask = x.createLinearGradient(0, 0, c.width, c.height);
  mask.addColorStop(0, "#1f2f29");
  mask.addColorStop(0.5, "#253a31");
  mask.addColorStop(1, "#1b2924");
  x.fillStyle = mask;
  x.fillRect(0, 0, c.width, c.height);
  // card millimetres from here on: canvas x = card x, canvas y = card z
  x.translate(c.width / 2, c.height / 2);
  x.scale(c.width / width, c.height / length);
  x.translate(0, -centerZ);
  const left = -width / 2;
  const right = width / 2;

  const COPPER = "#2c463a"; // mask over a copper pour reads a little lighter
  const TRACE = "#3e5c4d";
  const SIGNAL = "#5b7a6b";
  const SILK = "#c9cec6";
  const PAD = "#b9a676";

  const round = (u: number, z: number, w: number, d: number, r: number) => {
    x.beginPath();
    x.roundRect(u - w / 2, z - d / 2, w, d, r);
  };
  const line = (points: [number, number][]) => {
    x.beginPath();
    x.moveTo(...points[0]);
    points.slice(1).forEach((p) => x.lineTo(...p));
    x.stroke();
  };
  const via = (u: number, z: number, r = 0.32) => {
    x.beginPath();
    x.arc(u, z, r, 0, 2 * Math.PI);
    x.fillStyle = "#79775c";
    x.fill();
    x.beginPath();
    x.arc(u, z, r * 0.45, 0, 2 * Math.PI);
    x.fillStyle = "#14201b";
    x.fill();
  };
  const text = (s: string, u: number, z: number, size: number, opts: { rotate?: boolean; bold?: boolean; align?: CanvasTextAlign } = {}) => {
    x.save();
    x.translate(u, z);
    if (opts.rotate) x.rotate(-Math.PI / 2);
    x.font = `${opts.bold ? "bold " : ""}${size}px monospace`;
    x.textAlign = opts.align ?? "center";
    x.textBaseline = "middle";
    x.fillStyle = SILK;
    x.fillText(s, 0, 0);
    x.restore();
  };
  const all = footprints();
  const find = (ref: string) => all.find((f) => f.ref === ref)!;

  /* copper pours: the core supply's planes and the 12 V input */
  x.fillStyle = COPPER;
  round(0, -79, 100, 82, 2.5);
  x.fill();
  round(0, -112, 96, 14, 2);
  x.fill();
  round(30, -128, 18, 22, 2);
  x.fill();
  for (const s of [-1, 1]) {
    round(s * 37.5, 52, 25, 26, 2);
    x.fill();
  }
  // plane splits between the pours
  x.strokeStyle = "#17241f";
  x.lineWidth = 0.5;
  line([[-50, -95.5], [50, -95.5]]);
  line([[-50, -104], [50, -104]]);

  /* via fence round the edge, broken at the connectors */
  const nearConnector = (u: number, z: number) =>
    (u < 0 && z > pcie.front[0].z - 2 && z < pcie.back[pcie.back.length - 1].z + 2) ||
    (u > 0 && nvlink.some((n) => Math.abs(z - n.center) < 11));
  for (let z = BOARD.minZ + 3; z < BOARD.maxZ - 2; z += 2.4)
    for (const u of [left + 1.6, right - 1.6]) if (!nearConnector(u, z)) via(u, z, 0.28);
  for (let u = left + 4; u < right - 3; u += 2.4) {
    via(u, BOARD.minZ + 1.6, 0.28);
    via(u, BOARD.maxZ - 1.6, 0.28);
  }

  /* via arrays between each power stage and its choke */
  for (const p of phases) {
    const gap = p.choke[1] > p.stage[1] ? 1 : -1;
    for (let i = -1; i <= 1; i++) {
      via(p.stage[0] + i * 1.5, p.stage[1] + gap * (STAGE.d / 2 + 1.1));
      via(p.stage[0] + i * 1.5, p.stage[1] - gap * (STAGE.d / 2 + 0.9), 0.26);
    }
  }
  for (const [u, z] of COOLER_MOUNTS) for (let a = 0; a < 8; a++) via(u + Math.cos(a * Math.PI / 4) * 4.3, z + Math.sin(a * Math.PI / 4) * 4.3, 0.26);

  /* gate-drive and sense traces from the controllers to the stages */
  x.strokeStyle = TRACE;
  x.lineWidth = 0.22;
  phases.filter((p) => p.rail === "core").forEach((p, i) => {
    const ctl = p.stage[0] < 0 ? find("U2") : find("U3");
    const lane = -91.5 - (i % 9) * 0.35;
    line([[ctl.x + (p.stage[0] - ctl.x) * 0.1, ctl.z - ctl.d / 2], [ctl.x + (p.stage[0] - ctl.x) * 0.1, lane], [p.stage[0] - 1.6, lane], [p.stage[0] - 1.6, p.stage[1] + STAGE.d / 2]]);
  });

  /* differential pairs: PCIe from the fingers, NVLink from each connector */
  const pair = (points: [number, number][], meander: [number, number] | null, cap: number | null) => {
    x.strokeStyle = SIGNAL;
    x.lineWidth = 0.15;
    for (const off of [-0.22, 0.22]) {
      x.beginPath();
      points.forEach(([u, z], i) => {
        const p: [number, number] = [u, z + off];
        if (i === 0) x.moveTo(...p);
        else if (meander && i === points.length - 1) {
          // a length-matching serpentine on the last straight run
          const [m0, m1] = meander;
          x.lineTo(m0, p[1]);
          for (let k = 0, u2 = m0; u2 < m1; k++, u2 += 0.5) x.lineTo(u2 + 0.5, p[1] + (k % 2 ? 0 : 0.75));
          x.lineTo(...p);
        } else x.lineTo(...p);
      });
      x.stroke();
    }
    if (cap !== null) {
      // AC coupling capacitors on the transmit pairs
      x.fillStyle = "#8d7b62";
      for (const off of [-0.32, 0.32]) x.fillRect(cap - 0.3, points[0][1] + off - 0.15, 0.6, 0.3);
    }
  };
  const fingersEnd = pcie.edge + pcie.length;
  for (let k = 0; k < 32; k++) {
    const zf = -42 + k * 2.1;
    const zp = -24 + k * 1.5;
    pair([[fingersEnd + 0.2, zf], [-47, zf], [-40, zp], [-29.5, zp]], k % 3 === 1 ? [-38.5, -33] : null, k % 2 === 0 ? -49 : null);
  }
  nvlink.forEach((n, j) => {
    for (let k = 0; k < 6; k++) {
      const zf = n.center - 7 + k * 2.8;
      const zp = [-24, -6, 13][j] + k * 2;
      pair([[NVLINK.edge - NVLINK.length - 0.2, zf], [47, zf], [38.5, zp], [29.5, zp]], k % 2 ? [33, 37] : null, null);
    }
  });

  /* silkscreen */
  x.strokeStyle = SILK;
  x.lineWidth = 0.18;
  const box = (f: Footprint, pad = 0.4) => x.strokeRect(f.x - f.w / 2 - pad, f.z - f.d / 2 - pad, f.w + pad * 2, f.d + pad * 2);
  const corners = (f: Footprint, pad = 0.5, arm = 1.6) => {
    const l = f.x - f.w / 2 - pad, r = f.x + f.w / 2 + pad, t = f.z - f.d / 2 - pad, b = f.z + f.d / 2 + pad;
    for (const [cx, cz, dx, dz] of [[l, t, 1, 1], [r, t, -1, 1], [l, b, 1, -1], [r, b, -1, -1]])
      line([[cx + dx * arm, cz], [cx, cz], [cx, cz + dz * arm]]);
  };
  const dot = (u: number, z: number, r = 0.35) => {
    x.beginPath();
    x.arc(u, z, r, 0, 2 * Math.PI);
    x.fillStyle = SILK;
    x.fill();
  };

  // package: outline, pin-1 corner and its name
  const pkg = find("U1");
  box(pkg, 0.8);
  line([[pkg.x - 29.8, pkg.z - 26], [pkg.x - 26, pkg.z - 29.8]]);
  text("U1", -26.5, -31.6, 1.5);
  // the cooler's mounting holes: a keepout ring each
  for (const [u, z] of COOLER_MOUNTS) {
    x.beginPath();
    x.arc(u, z, 3.4, 0, 2 * Math.PI);
    x.stroke();
  }
  // power stages, chokes and their refdes in the gaps between rows
  all.filter((f) => f.kind === "stage" || f.kind === "choke").forEach((f) => (f.kind === "choke" ? corners(f) : box(f, 0.3)));
  phases.forEach((p, i) => {
    const [u, cz] = p.choke;
    const [, sz] = p.stage;
    const below = cz > sz; // choke further from the package than its stage?
    text(`L${101 + i}`, u, p.rail === "memory" ? cz + 5.4 : below ? cz + 5 : cz - 5, 1.15);
    text(`Q${101 + i}`, u, p.rail === "memory" ? sz - 4 : below ? sz - 4.3 : sz + 4.3, 1.1);
  });
  // polymer capacitors: outline with the anode corner cut, and a +
  polymerCaps.forEach(([u, z]) => {
    const l = u - POLYMER.w / 2 - 0.3, r = u + POLYMER.w / 2 + 0.3, t = z - POLYMER.d / 2 - 0.3, b = z + POLYMER.d / 2 + 0.3;
    line([[l, t], [r - 1, t], [r, t + 1], [r, b - 1], [r - 1, b], [l, b], [l, t]]);
    text("+", r + 0.9, z, 1.3, { bold: true });
  });
  // chips: outlines, pin-1 dots, refdes
  chips.forEach((ch) => {
    const f = find(ch.ref);
    box(f, ch.kind === "soic" ? 1.3 : 0.45);
    if (ch.kind !== "led" && ch.kind !== "crystal") dot(f.x - f.w / 2 - 1.1, f.z - f.d / 2 - 0.2, 0.3);
    text(ch.ref, f.x, f.z - f.d / 2 - (ch.kind === "soic" ? 2.4 : 1.4), 1.15);
  });
  text("PWR", 50.6, 91, 0.9, { align: "left" });
  text("ERR", 50.6, 97, 0.9, { align: "left" });
  // bulk cans: circle with the negative half hatched
  BULK.x.forEach((u, i) => {
    x.beginPath();
    x.arc(u, BULK.z, BULK.r + 0.35, 0, 2 * Math.PI);
    x.stroke();
    x.beginPath();
    x.arc(u, BULK.z, BULK.r + 0.35, 0, Math.PI);
    x.closePath();
    x.fillStyle = "rgba(201,206,198,0.35)";
    x.fill();
    text(`C${101 + i}`, u, BULK.z + BULK.r + 1.6, 1.1);
  });
  const j1 = find("J1");
  box(j1, 0.5);
  text("J1", j1.x - j1.w / 2 - 2, j1.z, 1.3);
  text("12V-2X6", j1.x, j1.z + j1.d / 2 + 1.7, 1.2);
  // input MLCCs and bypass caps are too small for refdes; a row label each
  text("C301-C318", -46.5, -88.5, 1, { rotate: true });

  // edge connectors
  text("PCIE X16", fingersEnd + 2.4, -8, 1.5, { rotate: true });
  text("B1", fingersEnd + 1.2, pcie.front[0].z, 0.9);
  text("B82", fingersEnd + 1.6, pcie.back[pcie.back.length - 1].z, 0.9);
  nvlink.forEach((n, j) => text(`NVL${j}`, NVLINK.edge - NVLINK.length - 2.2, n.center, 1.3, { rotate: true }));

  // fiducials (bare copper dots in a clearance ring) and test points
  for (const [u, z] of [[-50, 102], [50, -122], [50, 75]]) {
    x.beginPath();
    x.arc(u, z, 1.5, 0, 2 * Math.PI);
    x.fillStyle = "#121c18";
    x.fill();
    x.beginPath();
    x.arc(u, z, 0.55, 0, 2 * Math.PI);
    x.fillStyle = PAD;
    x.fill();
  }
  [[-10, -122], [0, -122], [10, -122], [-20, 67], [-8, 67], [4, 67]].forEach(([u, z], i) => {
    x.beginPath();
    x.arc(u, z, 0.6, 0, 2 * Math.PI);
    x.fillStyle = PAD;
    x.fill();
    text(`TP${i + 1}`, u, z + 1.6, 0.9);
  });

  // board ID, layer stack, date code and flammability rating
  text("UWHPC-G1 PCIE", 16, 92, 2, { bold: true, align: "left" });
  text("PCB REV A1  12L 1.6MM", 16, 95, 1.2, { align: "left" });
  text("2611  94V-0", 16, 97.4, 1.2, { align: "left" });
  text("UWHPC", 26, 104, 4.2, { bold: true });

  // serial label: white sticker, barcode, serial number
  x.fillStyle = "#e9ebe6";
  round(LABEL.x, LABEL.z, LABEL.w, LABEL.d, 0.8);
  x.fill();
  x.fillStyle = "#1c1d1f";
  let bar = LABEL.x - LABEL.w / 2 + 1.5;
  for (let i = 0; bar < LABEL.x + LABEL.w / 2 - 1.5; i++) {
    const w = [0.18, 0.36, 0.18, 0.54, 0.27][(i * 7) % 5];
    if (i % 2 === 0) x.fillRect(bar, LABEL.z - 3.6, w, 4.4);
    bar += w + 0.12;
  }
  x.font = "1.3px monospace";
  x.textAlign = "left";
  x.textBaseline = "middle";
  x.fillText("S/N 1652611034718", LABEL.x - LABEL.w / 2 + 1.5, LABEL.z + 2.4);
  x.fillText("REV A1", LABEL.x + LABEL.w / 2 - 6.2, LABEL.z + 2.4);
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
