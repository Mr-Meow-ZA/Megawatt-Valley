#!/usr/bin/env python3
"""Rebuild Megawatt Valley tree sprites — layered canopies, bark, baked shadows."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "game"
PREVIEW = Path("/tmp/sprite_preview")


def baked_shadow(canvas: Image.Image, cx: int, base_y: int, rx: int, ry: int) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    draw.ellipse((cx - rx, base_y - ry, cx + rx, base_y + ry), fill=(6, 18, 8, 95))
    draw.ellipse((cx - int(rx * 0.7), base_y - int(ry * 0.6), cx + int(rx * 0.55), base_y + int(ry * 0.5)), fill=(6, 18, 8, 55))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(3)))


def draw_trunk(
    draw: ImageDraw.ImageDraw,
    cx: int,
    base_y: int,
    height: int,
    width: int,
    rng: random.Random,
    bark: tuple[int, int, int] = (118, 78, 48),
) -> None:
    w2 = width // 2
    top_y = base_y - height
    # Main trunk — slight taper
    trunk_pts = [
        (cx - w2, base_y),
        (cx + w2, base_y),
        (cx + w2 - 2, top_y + 8),
        (cx - w2 + 2, top_y + 8),
    ]
    draw.polygon(trunk_pts, fill=bark)
    # Left highlight
    draw.polygon(
        [(cx - w2, base_y), (cx - w2 + 3, top_y + 8), (cx - 1, top_y + 8), (cx - 1, base_y)],
        fill=(min(255, bark[0] + 28), min(255, bark[1] + 22), min(255, bark[2] + 16)),
    )
    # Right shadow
    draw.polygon(
        [(cx + 1, base_y), (cx + w2, base_y), (cx + w2 - 2, top_y + 8), (cx + 1, top_y + 8)],
        fill=(max(0, bark[0] - 22), max(0, bark[1] - 18), max(0, bark[2] - 12)),
    )
    # Bark notches
    for i in range(rng.randint(3, 5)):
        ny = base_y - rng.randint(12, height - 10)
        nx = cx + rng.randint(-w2 + 1, w2 - 2)
        nw = rng.randint(3, 6)
        draw.line([(nx, ny), (nx + nw, ny + rng.randint(-1, 1))], fill=(max(0, bark[0] - 35), max(0, bark[1] - 28), max(0, bark[2] - 20)), width=1)
        draw.line([(nx, ny + 1), (nx + nw - 1, ny + 1)], fill=(min(255, bark[0] + 18), min(255, bark[1] + 14), min(255, bark[2] + 10)), width=1)


def draw_ellipse_cluster(
    draw: ImageDraw.ImageDraw,
    cx: int,
    cy: int,
    layers: list[tuple[int, int, int, tuple[int, int, int], int]],
) -> None:
    """Draw overlapping ellipses back-to-front (list: rx, ry, ox, color, alpha)."""
    for rx, ry, ox, color, alpha in layers:
        c = (*color, alpha)
        draw.ellipse((cx - rx + ox, cy - ry, cx + rx + ox, cy + ry), fill=c)


def draw_triangle_cluster(
    draw: ImageDraw.ImageDraw,
    cx: int,
    base_cy: int,
    specs: list[tuple[int, int, int, tuple[int, int, int], int]],
) -> None:
    """Iso-friendly triangle foliage lobes: half_w, height, ox, color, alpha."""
    for hw, h, ox, color, alpha in specs:
        top = base_cy - h
        pts = [(cx + ox, top), (cx + hw + ox, base_cy), (cx - hw + ox, base_cy)]
        draw.polygon(pts, fill=(*color, alpha))


def build_tree_conifer(seed: int = 1, scale: float = 1.0) -> Image.Image:
    """Standard pine — ~58×130."""
    w, h = int(64 * scale), int(140 * scale)
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rng = random.Random(seed)
    cx, base_y = w // 2, h - 14
    baked_shadow(canvas, cx, base_y + 4, int(22 * scale), int(8 * scale))

    draw = ImageDraw.Draw(canvas)
    trunk_h = int(38 * scale)
    draw_trunk(draw, cx, base_y, trunk_h, int(14 * scale), rng)

    dark = (28, 92, 58)
    mid = (42, 128, 78)
    light = (58, 158, 98)
    highlight = (78, 178, 118)

    # Layered conifer lobes — back to front
    tiers = [
        (int(26 * scale), int(22 * scale), -4, dark, 220),
        (int(28 * scale), int(24 * scale), 3, mid, 210),
        (int(24 * scale), int(20 * scale), -6, dark, 200),
        (int(22 * scale), int(18 * scale), 5, light, 195),
        (int(18 * scale), int(16 * scale), -2, mid, 190),
        (int(14 * scale), int(14 * scale), 2, highlight, 185),
    ]
    cy = base_y - trunk_h - int(8 * scale)
    for i, (rx, ry, ox, col, alpha) in enumerate(tiers):
        draw_ellipse_cluster(draw, cx, cy - i * int(14 * scale), [(rx, ry, ox, col, alpha)])
    # Triangle accents for denser silhouette
    tri_specs = [
        (int(20 * scale), int(28 * scale), -8, dark, 170),
        (int(18 * scale), int(26 * scale), 6, mid, 160),
        (int(14 * scale), int(22 * scale), 0, light, 150),
        (int(10 * scale), int(16 * scale), -3, highlight, 140),
    ]
    for i, spec in enumerate(tri_specs):
        draw_triangle_cluster(draw, cx, cy - i * int(12 * scale), [spec])

    return canvas


def build_tree_big(seed: int = 2) -> Image.Image:
    """Tall landmark pine — ~68×155."""
    w, h = 72, 160
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rng = random.Random(seed)
    cx, base_y = w // 2, h - 12
    baked_shadow(canvas, cx, base_y + 5, 28, 10)

    draw = ImageDraw.Draw(canvas)
    trunk_h = 48
    draw_trunk(draw, cx, base_y, trunk_h, 18, rng, bark=(108, 72, 42))

    dark = (24, 88, 55)
    mid = (38, 118, 72)
    light = (52, 148, 92)
    hi = (72, 168, 108)

    cy = base_y - trunk_h - 6
    for i in range(7):
        rx = 30 - i * 2
        ry = 24 - i
        ox = (-6 if i % 2 == 0 else 5)
        col = [dark, mid, light, mid, dark, light, hi][i]
        alpha = 215 - i * 5
        draw.ellipse((cx - rx + ox, cy - ry - i * 13, cx + rx + ox, cy + ry - i * 13), fill=(*col, alpha))

    # Side triangle lobes
    for i in range(5):
        hw = 22 - i * 2
        th = 30 - i * 2
        ox = -10 if i % 2 == 0 else 8
        col = mid if i % 2 else dark
        top = cy - i * 14 - th
        draw.polygon([(cx + ox, top), (cx + hw + ox, top + th), (cx - hw + ox, top + th)], fill=(*col, 165))

    # Small branch stubs
    for side in (-1, 1):
        by = base_y - rng.randint(28, 42)
        x0, x1 = cx + side * 8, cx + side * 14
        if x0 > x1:
            x0, x1 = x1, x0
        draw.rectangle((x0, by, x1, by + 3), fill=(100, 68, 38))

    return canvas


def build_tree_round(seed: int = 3) -> Image.Image:
    """Stacked round conifer tiers — ~62×145."""
    w, h = 66, 148
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rng = random.Random(seed)
    cx, base_y = w // 2, h - 12
    baked_shadow(canvas, cx, base_y + 4, 24, 9)

    draw = ImageDraw.Draw(canvas)
    trunk_h = 32
    draw_trunk(draw, cx, base_y, trunk_h, 12, rng, bark=(124, 82, 50))

    greens = [(32, 102, 62), (48, 132, 82), (62, 152, 98), (78, 172, 112)]
    cy = base_y - trunk_h
    for i in range(5):
        rx = 28 - i * 3
        ry = 18 - i
        ox = (i % 2) * 6 - 3
        col = greens[i % len(greens)]
        layer_y = cy - i * 16
        # Wide round tier
        draw.ellipse((cx - rx + ox, layer_y - ry * 2, cx + rx + ox, layer_y), fill=(*col, 210 - i * 8))
        # Overlap puff on top
        draw.ellipse((cx - rx + 4 + ox, layer_y - ry * 2 - 6, cx + rx - 4 + ox, layer_y - ry), fill=(*greens[(i + 1) % len(greens)], 180))

    return canvas


def build_tree_deciduous(seed: int = 4) -> Image.Image:
    """Broadleaf round canopy — ~60×130."""
    w, h = 64, 132
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    rng = random.Random(seed)
    cx, base_y = w // 2, h - 12
    baked_shadow(canvas, cx, base_y + 4, 26, 9)

    draw = ImageDraw.Draw(canvas)
    trunk_h = 36
    draw_trunk(draw, cx, base_y, trunk_h, 13, rng, bark=(112, 74, 44))

    # Warm autumn-leaning greens
    palette = [
        (48, 118, 52),
        (62, 138, 58),
        (78, 152, 62),
        (92, 162, 68),
        (108, 175, 72),
        (72, 128, 48),
    ]
    canopy_cy = base_y - trunk_h - 22
    clusters = [
        (30, 26, -8, 0),
        (28, 24, 6, 1),
        (26, 22, -4, 2),
        (24, 20, 5, 3),
        (20, 18, -2, 4),
        (16, 14, 3, 5),
        (22, 20, 0, 1),
        (18, 16, -6, 3),
        (14, 12, 4, 5),
    ]
    for rx, ry, ox, pi in clusters:
        col = palette[pi % len(palette)]
        draw.ellipse((cx - rx + ox, canopy_cy - ry, cx + rx + ox, canopy_cy + ry), fill=(*col, 195))

    # Leaf triangle accents
    for ang in range(0, 360, 45):
        rad = math.radians(ang)
        lx = int(cx + math.cos(rad) * 18)
        ly = int(canopy_cy + math.sin(rad) * 14)
        hw, ht = 8, 12
        draw.polygon([(lx, ly - ht), (lx + hw, ly), (lx - hw, ly)], fill=(*palette[ang % len(palette)], 140))

    return canvas


def main() -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    outputs = {
        "tree.png": build_tree_conifer(seed=1, scale=1.0),
        "tree_big.png": build_tree_big(seed=2),
        "tree_round.png": build_tree_round(seed=3),
        "tree_deciduous.png": build_tree_deciduous(seed=4),
    }
    for name, im in outputs.items():
        path = ASSET / name
        im.save(path, "PNG")
        im.save(PREVIEW / name, "PNG")
        print(f"Wrote {path} ({im.size[0]}x{im.size[1]})")


if __name__ == "__main__":
    main()
