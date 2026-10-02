#!/usr/bin/env python3
"""Generate soft snow-capped mountain backdrop silhouettes for far parallax."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "game"

SKY_FADE = (120, 168, 210)
MOUNTAIN_BASE = (72, 98, 72)
MOUNTAIN_MID = (58, 82, 62)
MOUNTAIN_DARK = (42, 62, 48)
SNOW = (248, 252, 255)
SNOW_SHADOW = (210, 220, 232)


def _ridge_points(
    w: int,
    h: int,
    seed: int,
    peaks: int,
    base_y: float,
) -> list[tuple[float, float]]:
    rng = random.Random(seed)
    pts: list[tuple[float, float]] = [(0, h)]
    x = 0.0
    while x < w:
        seg = rng.uniform(w / (peaks + 1.5), w / peaks)
        x = min(w, x + seg)
        peak_h = rng.uniform(h * 0.38, h * 0.72)
        # Shoulder before peak
        sx = max(0, x - seg * rng.uniform(0.35, 0.55))
        sy = base_y - peak_h * rng.uniform(0.45, 0.65)
        pts.append((sx, sy))
        pts.append((x, base_y - peak_h))
        # Descending shoulder
        dx = min(w, x + seg * rng.uniform(0.25, 0.45))
        dy = base_y - peak_h * rng.uniform(0.25, 0.5)
        pts.append((dx, dy))
    pts.append((w, h))
    return pts


def build_mountain(
    size: tuple[int, int],
    seed: int,
    peaks: int = 3,
    snow_line: float = 0.42,
) -> Image.Image:
    w, h = size
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    base_y = h * 0.88

    # Back layer (lighter, softer)
    back = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(back)
    back_pts = _ridge_points(w, h, seed + 11, peaks + 1, base_y + 8)
    bd.polygon([(int(x), int(y)) for x, y in back_pts], fill=(*MOUNTAIN_MID, 140))

    # Main mass
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    pts = _ridge_points(w, h, seed, peaks, base_y)
    draw.polygon([(int(x), int(y)) for x, y in pts], fill=(*MOUNTAIN_BASE, 255))

    # Dark lower slope shading
    shade = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for i in range(0, w, 24):
        sd.rectangle((i, int(base_y - 20), i + 12, h), fill=(*MOUNTAIN_DARK, 35))
    layer.alpha_composite(shade)

    # Snow caps along ridge segments
    snow_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sn = ImageDraw.Draw(snow_layer)
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        if y > base_y - h * snow_line:
            continue
        cap_w = random.Random(seed + i).uniform(18, 42)
        cap_h = random.Random(seed + i + 7).uniform(10, 28)
        sn.ellipse(
            (x - cap_w, y - cap_h * 0.4, x + cap_w, y + cap_h),
            fill=(*SNOW, 230),
        )
        # Shadow under snow lip
        sn.arc(
            (x - cap_w * 0.7, y, x + cap_w * 0.7, y + cap_h * 0.8),
            start=10,
            end=170,
            fill=(*SNOW_SHADOW, 120),
            width=2,
        )

    layer.alpha_composite(snow_layer)

    # Atmospheric fade at base (blend into sky/grass)
    fade = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fade)
    for row in range(int(base_y - 30), h):
        t = (row - (base_y - 30)) / max(1, h - base_y + 30)
        alpha = int(180 * t)
        fd.line([(0, row), (w, row)], fill=(*SKY_FADE, alpha))
    layer = Image.alpha_composite(back, layer)
    layer = Image.alpha_composite(layer, fade)

    # Soft blur for far-distance read
    layer = layer.filter(ImageFilter.GaussianBlur(0.6))
    canvas.alpha_composite(layer)
    return canvas


def main() -> None:
    ASSET.mkdir(parents=True, exist_ok=True)
    specs = [
        ("mountain_0.png", 300, 180, 101, 3),
        ("mountain_1.png", 300, 180, 202, 4),
        ("mountain_2.png", 300, 180, 303, 2),
    ]
    for name, w, h, seed, peaks in specs:
        im = build_mountain((w, h), seed=seed, peaks=peaks)
        path = ASSET / name
        im.save(path, "PNG")
        print(f"Wrote {path} {im.size[0]}x{im.size[1]}")


if __name__ == "__main__":
    main()
