#!/usr/bin/env python3
"""Generate tile_grass_hd_4..7 meadow variants from existing hd_0..3 tiles.

Applies hue/value shifts plus flower and dirt speckles so grass meadows
don't read as one repeating stripe.
"""

from __future__ import annotations

import colorsys
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "game"

FLOWER_COLORS = [
    (255, 106, 138),
    (255, 184, 74),
    (255, 225, 74),
    (210, 120, 255),
    (255, 255, 255),
]
DIRT_COLORS = [
    (118, 92, 62),
    (98, 78, 54),
    (138, 110, 78),
    (88, 72, 50),
]


def shift_hsv(
    im: Image.Image,
    hue_delta: float,
    sat_mult: float,
    val_mult: float,
) -> Image.Image:
    """Shift hue (0-1) and scale saturation/value per pixel (opaque only)."""
    rgba = im.convert("RGBA")
    out = Image.new("RGBA", rgba.size)
    src = rgba.load()
    dst = out.load()
    assert src is not None and dst is not None
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = src[x, y]
            if a < 16:
                dst[x, y] = (r, g, b, a)
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            h = (h + hue_delta) % 1.0
            s = max(0.0, min(1.0, s * sat_mult))
            v = max(0.0, min(1.0, v * val_mult))
            nr, ng, nb = colorsys.hsv_to_rgb(h, s, v)
            dst[x, y] = (int(nr * 255), int(ng * 255), int(nb * 255), a)
    return out


def add_meadow_speckles(
    im: Image.Image,
    seed: int,
    flower_count: int = 14,
    dirt_count: int = 22,
) -> Image.Image:
    """Scatter tiny flower and dirt speckles on the top diamond face."""
    out = im.copy()
    draw = ImageDraw.Draw(out)
    rng = random.Random(seed)
    w, h = out.size
    cx, cy = w // 2, h // 2 - 4
    # Approximate top-face diamond bounds (iso tile)
    top_y = 6
    bot_y = cy + 2

    def in_top_face(px: int, py: int) -> bool:
        if py < top_y or py > bot_y:
            return False
        rel = (py - top_y) / max(1, bot_y - top_y)
        half_w = int((w * 0.42) * rel + w * 0.08 * (1 - rel))
        return abs(px - cx) <= half_w

    for _ in range(flower_count):
        for _attempt in range(30):
            px = rng.randint(8, w - 9)
            py = rng.randint(top_y, bot_y)
            if not in_top_face(px, py):
                continue
            col = rng.choice(FLOWER_COLORS)
            # Tiny 2-3 px flower blob
            s = rng.choice([1, 2, 2, 3])
            draw.ellipse((px - s, py - s, px + s, py + s), fill=(*col, rng.randint(180, 240)))
            if s >= 2:
                draw.point((px, py), fill=(255, 240, 120, 220))
            break

    for _ in range(dirt_count):
        for _attempt in range(30):
            px = rng.randint(6, w - 7)
            py = rng.randint(top_y + 2, bot_y + 4)
            if not in_top_face(px, py) and py > bot_y - 2:
                continue
            col = rng.choice(DIRT_COLORS)
            s = rng.choice([1, 1, 2])
            draw.rectangle((px, py, px + s, py + s), fill=(*col, rng.randint(120, 200)))
            break

    # Occasional clover patch (3 tiny dots)
    for _ in range(rng.randint(2, 4)):
        px = rng.randint(20, w - 21)
        py = rng.randint(top_y + 4, bot_y - 2)
        if not in_top_face(px, py):
            continue
        for dx, dy in ((0, 0), (-2, 1), (2, 1)):
            draw.point((px + dx, py + dy), fill=(58, 140, 48, 210))

    return out


def build_variant(src_idx: int, dst_idx: int) -> Image.Image:
    src = Image.open(ASSET / f"tile_grass_hd_{src_idx}.png").convert("RGBA")
    # Distinct hue/value recipe per variant
    recipes = {
        4: (0.03, 1.08, 0.92),   # warmer, slightly darker
        5: (-0.04, 0.95, 1.08),  # cooler, brighter
        6: (0.06, 1.12, 0.88),   # yellow-green meadow
        7: (-0.02, 1.05, 0.95),  # muted riverbank green
    }
    hue_d, sat_m, val_m = recipes[dst_idx]
    shifted = shift_hsv(src, hue_d, sat_m, val_m)
    # Subtle contrast bump
    shifted = ImageEnhance.Contrast(shifted).enhance(1.04 + (dst_idx - 4) * 0.01)
    return add_meadow_speckles(shifted, seed=100 + dst_idx * 17)


def main() -> None:
    ASSET.mkdir(parents=True, exist_ok=True)
    for dst in range(4, 8):
        src = dst % 4
        im = build_variant(src, dst)
        path = ASSET / f"tile_grass_hd_{dst}.png"
        im.save(path, "PNG")
        print(f"Wrote {path} {im.size[0]}x{im.size[1]}")


if __name__ == "__main__":
    main()
