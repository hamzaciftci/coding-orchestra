#!/usr/bin/env python
# Generate a 1280x640 GitHub social-preview image for Coding Orchestra.
import math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1280, 640
L = 96  # left padding

# ---- fonts -------------------------------------------------------------
FONTS = {
    "bold":     ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"],
    "semibold": ["C:/Windows/Fonts/seguisb.ttf",  "C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"],
    "regular":  ["C:/Windows/Fonts/segoeui.ttf",  "C:/Windows/Fonts/arial.ttf"],
}
def font(kind, size):
    for p in FONTS[kind]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

# ---- colors ------------------------------------------------------------
PURPLE = (139, 122, 232)
PURPLE_DEEP = (110, 86, 207)
ORANGE = (217, 119, 87)
WHITE = (245, 244, 247)
MUTED = (183, 177, 198)
FAINT = (137, 131, 160)
CHIP_BG = (34, 29, 48)
CHIP_BD = (56, 47, 82)
CHIP_TX = (201, 194, 221)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# ---- background gradient ----------------------------------------------
top, bot = (27, 22, 38), (10, 9, 16)
bg = Image.new("RGB", (W, H))
d = ImageDraw.Draw(bg)
for y in range(H):
    d.line([(0, y), (W, y)], fill=lerp(top, bot, y / H))

# soft glows
glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse([-120, -220, 620, 360], fill=(110, 86, 207, 90))       # purple top-left
gd.ellipse([840, 300, 1500, 820], fill=(217, 119, 87, 55))        # orange bottom-right
glow = glow.filter(ImageFilter.GaussianBlur(120))
bg = Image.alpha_composite(bg.convert("RGBA"), glow)
d = ImageDraw.Draw(bg)

# thin accent hairline near top
d.line([(L, 62), (L + 300, 62)], fill=(110, 86, 207, 255), width=3)

# ---- kicker ------------------------------------------------------------
kick = "SKILLS  FOR  CLAUDE  CODE"
d.text((L, 78), kick, font=font("semibold", 27), fill=PURPLE)

# ---- title -------------------------------------------------------------
d.text((L, 116), "Coding Orchestra", font=font("bold", 100), fill=WHITE)

# ---- subtitle (two lines) ---------------------------------------------
sf = font("regular", 33)
d.text((L, 248), "11 senior-engineer skills + a master orchestrator —", font=sf, fill=MUTED)
d.text((L, 292), "from first commit to production-ready.", font=sf, fill=MUTED)

# ---- skill chips -------------------------------------------------------
chips = ["backend", "frontend", "security", "database", "testing", "deploy", "UI / UX"]
cf = font("semibold", 25)
x, y = L, 362
gap, ch, padx = 13, 50, 22
for c in chips:
    w = d.textlength(c, font=cf)
    cw = int(w + padx * 2)
    if x + cw > W - L:
        x = L
        y += ch + 12
    d.rounded_rectangle([x, y, x + cw, y + ch], radius=14, fill=CHIP_BG, outline=CHIP_BD, width=2)
    d.text((x + padx, y + (ch - 33) / 2), c, font=cf, fill=CHIP_TX)
    x += cw + gap

# ---- orchestra / equalizer motif --------------------------------------
base_y = 556
n = 46
span = W - 2 * L
bw = span / n * 0.62
step = span / n
heights = [30 + 70 * abs(math.sin(i * 0.55)) + 24 * abs(math.sin(i * 0.17 + 1)) for i in range(n)]
for i in range(n):
    bx = L + i * step
    bh = heights[i]
    col = lerp(PURPLE_DEEP, ORANGE, i / (n - 1))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.rounded_rectangle([bx, base_y - bh, bx + bw, base_y], radius=int(bw / 2),
                         fill=col + (150,))
    bg = Image.alpha_composite(bg, layer)
d = ImageDraw.Draw(bg)

# ---- footer ------------------------------------------------------------
ff = font("regular", 25)
footer = "MIT License      English + Türkçe      github.com/hamzaciftci/coding-orchestra"
d.text((L, 592), footer, font=ff, fill=FAINT)
# small dots between footer segments
for dx in (L + 148, L + 372):
    d.ellipse([dx, 604, dx + 5, 609], fill=PURPLE)

# ---- save --------------------------------------------------------------
out_dir = "C:/Users/hamza/OneDrive/Masaüstü/coding-orchestra/.github"
os.makedirs(out_dir, exist_ok=True)
out = out_dir + "/social-preview.png"
bg.convert("RGB").save(out, "PNG")
print("saved:", out, bg.size)
