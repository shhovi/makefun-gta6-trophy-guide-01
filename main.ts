import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
const args = process.argv.slice(2);

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// ---------- Minimal baseline grayscale JPEG encoder (no deps) ----------
const QTABLE = [
  16, 11, 10, 16, 24, 40, 51, 61,
  12, 12, 14, 19, 26, 58, 60, 55,
  14, 13, 16, 24, 40, 57, 69, 56,
  14, 17, 22, 29, 51, 87, 80, 62,
  18, 22, 37, 56, 68, 109, 103, 77,
  24, 35, 55, 64, 81, 104, 113, 92,
  49, 64, 78, 87, 103, 121, 120, 101,
  72, 92, 95, 98, 112, 100, 103, 99
];
const ZIGZAG = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5,
  12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28,
  35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51,
  58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63
];
const DC_BITS = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const DC_VALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const AC_BITS = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const AC_VALS = [
  0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
  0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
  0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
  0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
  0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
  0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
  0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
  0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
  0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
  0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
  0xf9, 0xfa
];

function buildHuff(bits, vals) {
  const codes = new Map();
  let code = 0;
  let k = 0;
  for (let len = 1; len <= 16; len++) {
    for (let i = 0; i < bits[len - 1]; i++) {
      codes.set(vals[k], { code, len });
      code++;
      k++;
    }
    code <<= 1;
  }
  return codes;
}
const DC_CODES = buildHuff(DC_BITS, DC_VALS);
const AC_CODES = buildHuff(AC_BITS, AC_VALS);

function scaledQ(quality) {
  const scale = quality < 50 ? 5000 / quality : 200 - quality * 2;
  return QTABLE.map((v) => Math.max(1, Math.min(255, Math.floor((v * scale + 50) / 100))));
}

function fdctQuant(block, q) {
  const out = new Array(64).fill(0);
  for (let v = 0; v < 8; v++) {
    for (let u = 0; u < 8; u++) {
      let sum = 0;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          sum += block[y * 8 + x] *
            Math.cos(((2 * x + 1) * u * Math.PI) / 16) *
            Math.cos(((2 * y + 1) * v * Math.PI) / 16);
        }
      }
      const cu = u === 0 ? Math.SQRT1_2 : 1;
      const cv = v === 0 ? Math.SQRT1_2 : 1;
      out[v * 8 + u] = Math.round((cu * cv * sum) / 4 / q[v * 8 + u]);
    }
  }
  return out;
}

function catSize(n) {
  let a = Math.abs(n);
  let s = 0;
  while (a > 0) { s++; a >>= 1; }
  return s;
}

function encodeGrayJPEG(width, height, pixelAt, quality) {
  const q = scaledQ(quality || 80);
  const bytes = [];
  const push = (...b) => { for (const x of b) bytes.push(x & 0xff); };
  const push16 = (n) => push((n >> 8) & 0xff, n & 0xff);
  // SOI
  push(0xff, 0xd8);
  // DQT
  push(0xff, 0xdb); push16(67); push(0x00);
  for (let i = 0; i < 64; i++) push(q[ZIGZAG[i]]);
  // SOF0 (1 component, grayscale)
  push(0xff, 0xc0); push16(11); push(8); push16(height); push16(width); push(1); push(1, 0x11, 0);
  // DHT (DC + AC luminance)
  push(0xff, 0xc4);
  push16(2 + 17 + DC_VALS.length + 17 + AC_VALS.length);
  push(0x00); for (const b of DC_BITS) push(b); for (const v of DC_VALS) push(v);
  push(0x10); for (const b of AC_BITS) push(b); for (const v of AC_VALS) push(v);
  // SOS
  push(0xff, 0xda); push16(8); push(1); push(1, 0x00); push(0, 63, 0);

  let bitBuf = 0;
  let bitCnt = 0;
  const emitBit = (bit) => {
    bitBuf = (bitBuf << 1) | bit;
    bitCnt++;
    if (bitCnt === 8) {
      push(bitBuf);
      if (bitBuf === 0xff) push(0x00);
      bitBuf = 0;
      bitCnt = 0;
    }
  };
  const emit = (code, len) => {
    for (let i = len - 1; i >= 0; i--) emitBit((code >> i) & 1);
  };
  const emitVal = (n, size) => {
    let v = n < 0 ? n - 1 : n;
    for (let i = size - 1; i >= 0; i--) emitBit((v >> i) & 1);
  };

  let prevDC = 0;
  const bxCount = Math.ceil(width / 8);
  const byCount = Math.ceil(height / 8);
  for (let by = 0; by < byCount; by++) {
    for (let bx = 0; bx < bxCount; bx++) {
      const block = new Array(64);
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const px = Math.min(width - 1, bx * 8 + x);
          const py = Math.min(height - 1, by * 8 + y);
          block[y * 8 + x] = pixelAt(px, py) - 128;
        }
      }
      const coeffs = fdctQuant(block, q);
      const zz = ZIGZAG.map((idx) => coeffs[idx]);
      const diff = zz[0] - prevDC;
      prevDC = zz[0];
      const ds = catSize(diff);
      const dc = DC_CODES.get(ds);
      emit(dc.code, dc.len);
      if (ds > 0) emitVal(diff, ds);
      let run = 0;
      for (let i = 1; i < 64; i++) {
        if (zz[i] === 0) { run++; continue; }
        while (run > 15) {
          const zrl = AC_CODES.get(0xf0);
          emit(zrl.code, zrl.len);
          run -= 16;
        }
        const s = catSize(zz[i]);
        const ac = AC_CODES.get((run << 4) | s);
        emit(ac.code, ac.len);
        emitVal(zz[i], s);
        run = 0;
      }
      if (run > 0) {
        const eob = AC_CODES.get(0x00);
        emit(eob.code, eob.len);
      }
    }
  }
  while (bitCnt !== 0) emitBit(1);
  push(0xff, 0xd9);
  return Buffer.from(bytes);
}

// ---------- Screenshot patterns (480x270 grayscale gradients) ----------
function shotPixel(name) {
  if (name === "2-roadmap") {
    return (x, y) => Math.floor(40 + (y / 270) * 140 + (Math.floor(y / 54) % 2) * 25);
  }
  if (name === "3-missable") {
    return (x, y) => Math.floor(30 + (x / 480) * 160 + (Math.floor(x / 60) % 2) * 20);
  }
  if (name === "4-spoiler") {
    return (x, y) => Math.floor(50 + ((x + y) / 750) * 150);
  }
  return (x, y) => {
    const border = x < 6 || y < 6 || x >= 474 || y >= 264 ? 40 : 0;
    return Math.floor(35 + (x / 480) * 90 + (y / 270) * 90 + border);
  };
}

function renderScreenshots() {
  const shotsData = JSON.parse(readFileSync(join(here, "shots.json"), "utf8"));
  const shotsDir = join(here, "screenshots");
  mkdirSync(shotsDir, { recursive: true });
  for (const shot of shotsData.shots) {
    const jpg = encodeGrayJPEG(480, 270, shotPixel(shot.name), 80);
    writeFileSync(join(shotsDir, shot.name + ".jpg"), jpg);
  }
  return shotsData.shots.length;
}

function renderStatic(trophies) {
  mkdirSync(outDir, { recursive: true });
  const byTier = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let missable = 0;
  let spoiler = 0;
  for (const t of trophies) {
    if (t.tier in byTier) byTier[t.tier]++;
    if (t.missable) missable++;
    if (t.spoiler) spoiler++;
  }
  const summary = { total: trophies.length, byTier, missable, spoiler };
  writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");

  const phaseNames = {
    1: "Phase 1 — First steps in Leonida",
    2: "Phase 2 — Settle in and explore",
    3: "Phase 3 — Mid-game push",
    4: "Phase 4 — Late-game cleanup",
    5: "Phase 5 — Platinum finish"
  };
  let roadmapHtml = "";
  for (let p = 1; p <= 5; p++) {
    const inPhase = trophies.filter((t) => t.phase === p);
    roadmapHtml += "<section><h3>" + esc(phaseNames[p]) + " (" + inPhase.length + " trophies)</h3><ul>";
    for (const t of inPhase) {
      roadmapHtml += "<li>" + esc(t.name) + " — " + esc(t.tier) + "</li>";
    }
    roadmapHtml += "</ul></section>";
  }
  let listHtml = "";
  for (const t of trophies) {
    listHtml += "<article><h3>" + esc(t.name) + "</h3><p>" + esc(t.description) + "</p>" +
      "<p>" + esc(t.tier) + " · " + esc(t.category) + " · Phase " + t.phase +
      (t.missable ? " · Missable" : "") + (t.spoiler ? " · Spoiler" : "") + "</p></article>";
  }
  const html = "<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\">" +
    "<title>Vice Trophy Guide — snapshot</title></head><body>" +
    "<h1>Vice Trophy Guide — GTA VI trophy tracker &amp; platinum roadmap</h1>" +
    "<p>" + summary.total + " trophies: " + byTier.platinum + " platinum, " + byTier.gold + " gold, " +
    byTier.silver + " silver, " + byTier.bronze + " bronze. Missable: " + missable + ". Spoilers: " + spoiler + ".</p>" +
    "<h2>Platinum roadmap</h2>" + roadmapHtml +
    "<h2>Trophy tracker</h2>" + listHtml +
    "<p>Fan-made placeholders for an unreleased game.</p></body></html>\n";
  writeFileSync(join(outDir, "index.html"), html);
  return summary;
}

if (args.includes("--serve")) {
  console.log("Run `node serve.ts` to serve the app (main.ts never blocks).");
  process.exit(0);
}

const trophies = JSON.parse(readFileSync(join(here, "app", "data", "trophies.json"), "utf8")).trophies;

if (args.includes("--shots")) {
  const n = renderScreenshots();
  console.log("Rendered " + n + " screenshots.");
  process.exit(0);
}

const summary = renderStatic(trophies);
const n = renderScreenshots();
console.log("Vice Trophy Guide: " + summary.total + " trophies, " + n + " screenshots -> " + outDir);
process.exit(0);
