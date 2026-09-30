#!/usr/bin/env python3
"""Rebuild fence + pylon sprites for Megawatt Valley (Phaser assets).

Replaces tubular handrail / cooling-tower stand-ins with:
  - fence.png       120×50  isometric chain-link segment
  - fence_short.png  80×40  shorter chain-link segment
  - pylon.png        80×160 steel lattice transmission tower
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "game"

# Steel / fence palette (matches rebuild_solar_sprites / textures.ts)
STEEL_DARK = (72, 78, 88)
STEEL = (110, 118, 130)
STEEL_LITE = (150, 158, 170)
STEEL_HI = (188, 196, 208)
FENCE_POST = (78, 84, 94)
FENCE_RAIL = (118, 126, 138)
MESH = (132, 140, 152)
MESH_DIM = (120, 128, 140)
WHITE = (245, 248, 252)
WHITE_SHADE = (210, 216, 224)
ACCENT = (230, 190, 60)


def soft_ground_shadow(
    canvas: Image.Image,
    cx: float,
    cy: float,
    rx: float,
    ry: float,
    opacity: int = 70,
    blur: float = 3.5,
) -> None:
    sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse(
        (int(cx - rx), int(cy - ry), int(cx + rx), int(cy + ry)),
        fill=(0, 0, 0, opacity),
    )
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def draw_chain_link_fence(
    size: tuple[int, int],
    post_spacing: float = 18.0,
    post_h: int = 34,
) -> Image.Image:
    """Isometric chain-link fence segment — thick posts, visible mesh, iso diamond-friendly."""
    w, h = size
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Isometric ground line: left → right with slight downward skew (2:1 feel)
    margin_x = 6
    x0, x1 = margin_x, w - margin_x
    # Base y sits near bottom; left end slightly higher for iso read
    y0 = h - 10
    y1 = h - 6
    # Iso rise of fence top is vertical (posts)

    soft_ground_shadow(
        canvas,
        (x0 + x1) / 2,
        (y0 + y1) / 2 + 2,
        (x1 - x0) / 2 + 6,
        6.5,
        opacity=72,
        blur=3.2,
    )

    span = x1 - x0
    n_gaps = max(2, round(span / post_spacing))
    posts: list[tuple[float, float]] = []
    for i in range(n_gaps + 1):
        t = i / n_gaps
        px = _lerp(x0, x1, t)
        py = _lerp(y0, y1, t)
        posts.append((px, py))

    # Diamond mesh between posts (drawn first so posts/rails sit on top)
    for i in range(len(posts) - 1):
        ax, ay = posts[i]
        bx, by = posts[i + 1]
        top_a = ay - post_h + 4
        top_b = by - post_h + 4
        bot_a = ay - 4
        bot_b = by - 4
        # Classic chain-link: paired diagonals forming diamonds (denser, higher contrast)
        cell = 4
        steps = max(4, int(abs(bx - ax) / cell))
        for s in range(steps + 1):
            t = s / steps
            mx = _lerp(ax, bx, t)
            my_top = _lerp(top_a, top_b, t)
            my_bot = _lerp(bot_a, bot_b, t)
            half_w = 5.5
            draw.line(
                [(mx - half_w, my_top), (mx + half_w, my_bot)],
                fill=(*MESH, 175),
                width=2,
            )
            draw.line(
                [(mx + half_w, my_top), (mx - half_w, my_bot)],
                fill=(*MESH_DIM, 150),
                width=2,
            )
        # Offset row for denser diamond read
        for s in range(steps):
            t = (s + 0.5) / steps
            mx = _lerp(ax, bx, t)
            my_top = _lerp(top_a, top_b, t)
            my_bot = _lerp(bot_a, bot_b, t)
            mid = (my_top + my_bot) / 2
            half_w = 3.5
            draw.line(
                [(mx - half_w, mid - 5), (mx + half_w, mid + 5)],
                fill=(*MESH, 100),
                width=1,
            )
            draw.line(
                [(mx + half_w, mid - 5), (mx - half_w, mid + 5)],
                fill=(*MESH_DIM, 85),
                width=1,
            )

    # Horizontal rails (top, mid, bottom knuckle rail) — thicker for readability
    for dy_frac, width, col in (
        (1.0, 3, (*FENCE_RAIL, 255)),       # top rail
        (0.55, 3, (*STEEL, 230)),           # mid rail
        (0.14, 3, (*FENCE_RAIL, 245)),      # bottom rail
    ):
        pts = [(px, py - post_h * dy_frac) for px, py in posts]
        draw.line(pts, fill=col, width=width)

    # Metal posts + caps (thicker)
    for px, py in posts:
        draw.line([(px - 2, py - post_h), (px - 2, py)], fill=(*STEEL_DARK, 255), width=2)
        draw.line([(px, py - post_h), (px, py)], fill=(*FENCE_POST, 255), width=4)
        draw.line([(px + 2, py - post_h + 1), (px + 2, py - 1)], fill=(*STEEL_LITE, 210), width=2)
        # Cap
        draw.rectangle(
            (px - 3, py - post_h - 3, px + 3, py - post_h + 2),
            fill=(*STEEL_HI, 255),
        )
        draw.rectangle(
            (px - 2, py - post_h - 4, px + 2, py - post_h - 1),
            fill=(*STEEL_LITE, 255),
        )
        # Foot plate
        draw.ellipse((px - 3, py - 1, px + 3, py + 2), fill=(*STEEL_DARK, 200))

    canvas.alpha_composite(layer)
    return canvas


def _leg_x(t: float, cx: float, base_spread: float, top_spread: float) -> tuple[float, float]:
    """Left/right x at height fraction t (0=top, 1=base)."""
    spread = _lerp(top_spread, base_spread, t)
    return cx - spread, cx + spread


def draw_lattice_pylon(size: tuple[int, int] = (80, 160)) -> Image.Image:
    """Steel lattice A-frame transmission tower with cross-arms + insulators."""
    w, h = size
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    cx = w / 2
    base_y = h - 8
    top_y = 10
    base_spread = 22.0
    top_spread = 5.5
    shaft_h = base_y - top_y

    soft_ground_shadow(canvas, cx, base_y + 1, 26, 7, opacity=65, blur=3.0)

    # Main A-frame legs (double stroke for steel read)
    lx0, rx0 = _leg_x(0.0, cx, base_spread, top_spread)
    lx1, rx1 = _leg_x(1.0, cx, base_spread, top_spread)
    # Outer darker
    draw.line([(lx0 - 1, top_y), (lx1 - 1, base_y)], fill=(*STEEL_DARK, 255), width=2)
    draw.line([(rx0 + 1, top_y), (rx1 + 1, base_y)], fill=(*STEEL_DARK, 255), width=2)
    # Inner lighter
    draw.line([(lx0, top_y), (lx1, base_y)], fill=(*STEEL, 255), width=2)
    draw.line([(rx0, top_y), (rx1, base_y)], fill=(*STEEL, 255), width=2)
    # Highlight edge
    draw.line([(lx0 + 1, top_y + 2), (lx1 + 1, base_y - 2)], fill=(*STEEL_LITE, 120), width=1)
    draw.line([(rx0 - 1, top_y + 2), (rx1 - 1, base_y - 2)], fill=(*STEEL_LITE, 120), width=1)

    # Horizontal braces + X lattice along shaft
    levels = [0.08, 0.18, 0.30, 0.42, 0.54, 0.66, 0.78, 0.90]
    for i, t in enumerate(levels):
        y = top_y + shaft_h * t
        lx, rx = _leg_x(t, cx, base_spread, top_spread)
        # Horizontal cross-member
        draw.line([(lx, y), (rx, y)], fill=(*STEEL, 240), width=2)
        draw.line([(lx + 1, y + 1), (rx - 1, y + 1)], fill=(*STEEL_DARK, 160), width=1)
        # X brace to next level
        if i < len(levels) - 1:
            t2 = levels[i + 1]
            y2 = top_y + shaft_h * t2
            lx2, rx2 = _leg_x(t2, cx, base_spread, top_spread)
            draw.line([(lx, y), (rx2, y2)], fill=(*STEEL_LITE, 190), width=1)
            draw.line([(rx, y), (lx2, y2)], fill=(*STEEL_LITE, 190), width=1)

    # Peak plate + warning tip
    peak_y = top_y - 2
    draw.rectangle((cx - 5, peak_y, cx + 5, peak_y + 5), fill=(*STEEL_LITE, 255))
    draw.rectangle((cx - 2, peak_y - 3, cx + 2, peak_y), fill=(*ACCENT, 230))

    # Cross-arms near top with insulator strings
    arms = [
        {"t": 0.12, "span": 30, "hangers": 2},
        {"t": 0.22, "span": 26, "hangers": 2},
        {"t": 0.32, "span": 20, "hangers": 1},
    ]
    for arm in arms:
        y = top_y + shaft_h * arm["t"]
        span = arm["span"]
        # Arm beam
        draw.line([(cx - span, y), (cx + span, y)], fill=(*STEEL_DARK, 255), width=3)
        draw.line([(cx - span, y + 2), (cx + span, y + 2)], fill=(*STEEL, 200), width=1)
        # End caps
        for side in (-1, 1):
            ex = cx + side * span
            draw.rectangle((ex - 2, y - 2, ex + 2, y + 3), fill=(*STEEL_HI, 255))
        # Insulator hangers
        n = arm["hangers"]
        for side in (-1, 1):
            for hi in range(n):
                # Outer hangers near tip; second closer in if n==2
                if n == 1:
                    hx = cx + side * (span - 5)
                else:
                    hx = cx + side * (span - 4 - hi * 9)
                # Drop wire
                draw.line([(hx, y), (hx, y + 6)], fill=(*STEEL_DARK, 255), width=1)
                # Stacked white insulator discs
                for d_i, dy in enumerate((7, 10, 13)):
                    r = 3.2 - d_i * 0.35
                    draw.ellipse(
                        (hx - r, y + dy - r * 0.55, hx + r, y + dy + r * 0.55),
                        fill=(*WHITE, 255),
                        outline=(*WHITE_SHADE, 255),
                    )

    # Base footings
    for side in (-1, 1):
        fx = cx + side * base_spread
        draw.polygon(
            [
                (fx - 4, base_y),
                (fx + 4, base_y),
                (fx + 3, base_y + 3),
                (fx - 3, base_y + 3),
            ],
            fill=(*STEEL_DARK, 230),
        )
        draw.rectangle((fx - 5, base_y + 2, fx + 5, base_y + 4), fill=(*STEEL, 200))

    canvas.alpha_composite(layer)
    return canvas


def main() -> None:
    ASSET.mkdir(parents=True, exist_ok=True)

    fence = draw_chain_link_fence((120, 50), post_spacing=17.0, post_h=34)
    fence_short = draw_chain_link_fence((80, 40), post_spacing=15.0, post_h=28)
    pylon = draw_lattice_pylon((80, 160))

    fence_path = ASSET / "fence.png"
    short_path = ASSET / "fence_short.png"
    pylon_path = ASSET / "pylon.png"

    fence.save(fence_path, "PNG")
    fence_short.save(short_path, "PNG")
    pylon.save(pylon_path, "PNG")

    # Visual sanity copies
    fence.save("/tmp/fence_check.png", "PNG")
    pylon.save("/tmp/pylon_check.png", "PNG")
    fence_short.save("/tmp/fence_short_check.png", "PNG")

    for p in (fence_path, short_path, pylon_path):
        im = Image.open(p)
        print(f"wrote {p.name}: {im.size} mode={im.mode} bbox={im.getbbox()}")


if __name__ == "__main__":
    main()
