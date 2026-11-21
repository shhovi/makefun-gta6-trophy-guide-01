import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./serve.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));

const PY = `
import json, os
from PIL import Image, ImageDraw, ImageFont

base = os.path.dirname(os.path.abspath(__file__))
root = os.environ.get("GUIDE_ROOT", ".")
data = json.load(open(os.path.join(root, "app/data/trophies.json")))
trophies = data["trophies"]
roadmap = data["roadmap"]
outdir = os.path.join(root, "screenshots")
os.makedirs(outdir, exist_ok=True)

BG = (11, 14, 26)
PANEL = (20, 26, 46)
PINK = (255, 46, 136)
TEAL = (0, 229, 192)
TEXT = (232, 236, 245)
MUTED = (154, 163, 184)
TIER_COLORS = {
    "platinum": (232, 240, 255),
    "gold": (255, 201, 60),
    "silver": (192, 200, 216),
    "bronze": (205, 127, 50),
}

def font(size):
    for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            pass
    return ImageFont.load_default()

def canvas(title, subtitle):
    img = Image.new("RGB", (1200, 800), BG)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 1200, 110], fill=(26, 16, 51))
    d.text((40, 22), title, font=font(34), fill=PINK)
    d.text((40, 66), subtitle, font=font(18), fill=TEAL)
    return img, d

def draw_progress(d, earned, total, y=130):
    d.rounded_rectangle([40, y, 1160, y+18], radius=9, fill=(35, 42, 68))
    w = int(1120 * (earned / total)) if total else 0
    if w > 0:
        d.rounded_rectangle([40, y, 40+w, y+18], radius=9, fill=PINK)
    d.text((40, y+24), f"{earned} / {total} earned", font=font(16), fill=MUTED)

def draw_rows(d, rows, start_y=190, max_rows=12):
    y = start_y
    for t in rows[:max_rows]:
        c = TIER_COLORS.get(t["tier"], MUTED)
        d.rounded_rectangle([40, y, 1160, y+44], radius=8, fill=PANEL)
        d.rectangle([40, y, 48, y+44], fill=c)
        d.rectangle([60, y+12, 80, y+32], outline=MUTED, width=2)
        label = t["name"]
        if t.get("missable"):
            label += "  [Missable]"
        if t.get("spoiler"):
            label += "  [Spoiler]"
        d.text((95, y+6), label, font=font(18), fill=TEXT)
        d.text((95, y+26), t["tier"].upper(), font=font(12), fill=c)
        y += 52

# 1 tracker
img, d = canvas("Vice Trophy Guide", "GTA VI trophy tracker & platinum roadmap")
draw_progress(d, 0, len(trophies))
draw_rows(d, [t for t in trophies if not t["spoiler"]])
img.save(os.path.join(outdir, "1-tracker.jpg"), quality=88)

# 2 roadmap
img, d = canvas("Platinum Roadmap", "Six steps to the platinum")
y = 150
for s in roadmap:
    d.rounded_rectangle([40, y, 1160, y+88], radius=8, fill=PANEL)
    d.text((60, y+10), f"Step {s['step']}: {s['title']}", font=font(20), fill=PINK)
    d.text((60, y+40), s["detail"][:95], font=font(15), fill=TEXT)
    y += 100
img.save(os.path.join(outdir, "2-roadmap.jpg"), quality=88)

# 3 missable
img, d = canvas("Missable Trophies", "Watch these before the finale")
miss = [t for t in trophies if t["missable"]]
draw_progress(d, 0, len(trophies))
draw_rows(d, miss)
img.save(os.path.join(outdir, "3-missable.jpg"), quality=88)

# 4 spoiler
img, d = canvas("Vice Trophy Guide", "All trophies including spoilers")
draw_progress(d, 0, len(trophies))
draw_rows(d, trophies)
img.save(os.path.join(outdir, "4-spoiler.jpg"), quality=88)

print("wrote screenshots")
`;

function shots() {
  mkdirSync(join(HERE, "screenshots"), { recursive: true });
  writeFileSync("/tmp/render_shots.py", PY);
  execFileSync("python3", ["/tmp/render_shots.py"], {
    stdio: "inherit",
    env: { ...process.env, GUIDE_ROOT: HERE },
  });
  for (const n of ["1-tracker.jpg", "2-roadmap.jpg", "3-missable.jpg", "4-spoiler.jpg"]) {
    console.log(join(HERE, "screenshots", n));
  }
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Usage: node main.ts [--shots]\n  (no args)  start the static server on PORT or 4173\n  --shots    regenerate the four screenshots in screenshots/");
} else if (process.argv.includes("--shots")) {
  shots();
} else {
  startServer();
}
