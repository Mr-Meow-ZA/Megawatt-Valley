#!/usr/bin/env python3
"""Procedural high-quality isometric solar farm sprites for Megawatt Valley.

Replaces Kenney industrial pv_group arches with true tilted blue PV panels,
steel racks, gravel pads, soft shadows, and chain-link fence perimeters.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "game"
PREVIEW = Path("/tmp/sprite_preview")

# Azure / cyan solar blues — NOT purple
PANEL_DEEP = (26, 74, 154)       # #1a4a9a
PANEL_MID = (36, 96, 180)
PANEL_FACE = (45, 120, 210)
PANEL_LITE = (74, 154, 239)      # #4a9aef
PANEL_CELL = (90, 170, 245)
PANEL_GLINT = (180, 220, 255)
STEEL = (92, 100, 112)
STEEL_DARK = (58, 64, 74)
STEEL_LITE = (140, 148, 160)
GOLD = (220, 175, 55)
GOLD_DIM = (170, 130, 40)
GRAVEL = (168, 156, 132)
GRAVEL_DARK = (118, 108, 92)
FENCE = (110, 118, 130)
FENCE_POST = (72, 78, 88)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def blend(c0: tuple[int, int, int], c1: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(lerp(c0[0], c1[0], t)),
        int(lerp(c0[1], c1[1], t)),
        int(lerp(c0[2], c1[2], t)),
    )


def soft_ellipse_shadow(
    canvas: Image.Image,
    cx: int,
    cy: int,
    rx: int,
    ry: int,
    opacity: int = 85,
    blur: float = 5.0,
) -> None:
    sh = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(20, 18, 14, opacity))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))


def draw_gravel_pad(
    canvas: Image.Image,
    cx: int,
    cy: int,
    rx: int,
    ry: int,
    gold_accent: bool = False,
    seed: int = 42,
) -> list[tuple[int, int]]:
    """Isometric diamond gravel pad. Returns diamond corners N,E,S,W."""
    soft_ellipse_shadow(canvas, cx, cy + 6, rx + 6, max(8, ry // 2 + 4), opacity=70, blur=6)

    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    diamond = [
        (cx, cy - ry),          # N
        (cx + rx, cy),          # E
        (cx, cy + ry),          # S
        (cx - rx, cy),          # W
    ]
    draw.polygon(diamond, fill=(*GRAVEL_DARK, 255))
    # Inner fill slightly inset
    inset = [
        (cx, cy - ry + 3),
        (cx + rx - 4, cy),
        (cx, cy + ry - 3),
        (cx - rx + 4, cy),
    ]
    draw.polygon(inset, fill=(*GRAVEL, 255))
    # Highlight band
    draw.polygon(
        [
            (cx - int(rx * 0.35), cy - int(ry * 0.15)),
            (cx, cy - ry + 8),
            (cx + int(rx * 0.15), cy - int(ry * 0.05)),
            (cx - int(rx * 0.1), cy + 4),
        ],
        fill=(188, 176, 150, 70),
    )

    rng = random.Random(seed)
    for _ in range(int(rx * ry * 0.09)):
        # Rejection sample inside diamond via ellipse approx
        ang = rng.random() * math.tau
        rad = math.sqrt(rng.random())
        x = int(cx + math.cos(ang) * rx * 0.88 * rad)
        y = int(cy + math.sin(ang) * ry * 0.88 * rad)
        tone = rng.randint(-30, 24)
        c = (
            max(0, min(255, 158 + tone)),
            max(0, min(255, 146 + tone)),
            max(0, min(255, 122 + tone)),
            rng.choice([160, 190, 220, 255]),
        )
        s = rng.choice([1, 1, 1, 2])
        draw.rectangle((x, y, x + s, y + s), fill=c)

    draw.line(diamond + [diamond[0]], fill=(96, 86, 70, 210), width=2)

    if gold_accent:
        for i, (px, py) in enumerate(diamond):
            nx, ny = diamond[(i + 1) % 4]
            for t0, t1, col in ((0.0, 0.2, GOLD), (0.8, 1.0, GOLD_DIM)):
                ax0 = int(px + (nx - px) * t0)
                ay0 = int(py + (ny - py) * t0)
                ax1 = int(px + (nx - px) * t1)
                ay1 = int(py + (ny - py) * t1)
                draw.line([(ax0, ay0), (ax1, ay1)], fill=(*col, 230), width=3)
            draw.ellipse((px - 3, py - 3, px + 3, py + 3), fill=(*GOLD, 240))

    canvas.alpha_composite(layer)
    return diamond


def iso_quad(
    cx: float,
    cy: float,
    hw: float,
    hh: float,
    skew: float = 0.0,
) -> list[tuple[float, float]]:
    """Isometric diamond (panel face). Optional skew for tilt toward viewer."""
    return [
        (cx + skew, cy - hh),          # top
        (cx + hw + skew * 0.3, cy),    # right
        (cx - skew * 0.2, cy + hh),    # bottom
        (cx - hw - skew * 0.3, cy),    # left
    ]


def draw_iso_panel(
    canvas: Image.Image,
    cx: float,
    cy: float,
    hw: float = 14,
    hh: float = 8,
    premium: bool = False,
    cells_u: int = 3,
    cells_v: int = 2,
) -> None:
    """Draw one tilted isometric solar panel with cell grid + steel rack legs."""
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Mounting rack legs (drawn first, behind panel)
    leg = (*STEEL_DARK, 240)
    foot = (*STEEL, 220)
    # Left & right posts under lower face
    for dx, dy in ((-hw * 0.55, hh * 0.35), (hw * 0.45, hh * 0.25)):
        x0, y0 = cx + dx, cy + dy
        draw.line([(x0, y0), (x0 - 1, y0 + 11)], fill=leg, width=2)
        draw.line([(x0 + 1, y0), (x0, y0 + 11)], fill=(*STEEL, 180), width=1)
        draw.ellipse((x0 - 3, y0 + 10, x0 + 2, y0 + 14), fill=foot)
    # Cross brace
    draw.line(
        [(cx - hw * 0.5, cy + hh * 0.4 + 6), (cx + hw * 0.4, cy + hh * 0.3 + 6)],
        fill=(*STEEL, 160),
        width=1,
    )

    # Panel underside / thickness (dark edge below diamond)
    underside = [
        (cx - hw, cy + 1),
        (cx, cy + hh + 1),
        (cx + hw, cy + 1),
        (cx + hw, cy + 5),
        (cx, cy + hh + 5),
        (cx - hw, cy + 5),
    ]
    draw.polygon(underside, fill=(10, 24, 56, 230))

    # Main panel face — gradient via horizontal strips along iso V
    face = iso_quad(cx, cy, hw, hh)
    # Deep base fill
    draw.polygon([(int(x), int(y)) for x, y in face], fill=(*PANEL_DEEP, 255))

    # Paint face with vertical-ish bands for depth (top-left lighter)
    for i in range(12):
        t = i / 11
        # Interpolate along left→right of diamond
        p0 = (
            lerp(face[0][0], face[3][0], t * 0.5) if t < 0.5 else lerp(face[3][0], face[2][0], (t - 0.5) * 2),
            lerp(face[0][1], face[3][1], t * 0.5) if t < 0.5 else lerp(face[3][1], face[2][1], (t - 0.5) * 2),
        )
        # Simpler: subsample diamond with inset polygons
        inset = 1 + i * 0.35
        if inset >= min(hw, hh) - 1:
            break
        q = iso_quad(cx - i * 0.15, cy - i * 0.1, hw - inset, hh - inset * 0.55)
        col = blend(PANEL_DEEP, PANEL_LITE, t * 0.55)
        draw.polygon([(int(x), int(y)) for x, y in q], fill=(*col, 255))

    # Mid fill for readable azure/cyan (brighter face)
    mid = iso_quad(cx, cy, hw - 1.0, hh - 0.7)
    draw.polygon([(int(x), int(y)) for x, y in mid], fill=(*PANEL_FACE, 255))
    lite = iso_quad(cx - 0.4, cy - 0.6, hw - 2.2, hh - 1.6)
    draw.polygon([(int(x), int(y)) for x, y in lite], fill=(*PANEL_LITE, 210))

    # Cell grid — lines along both iso axes
    frame_col = GOLD if premium else blend(PANEL_DEEP, PANEL_LITE, 0.7)
    cell_a = (*PANEL_CELL, 180)
    cell_b = (18, 55, 120, 150)

    def lerp_pt(a: tuple[float, float], b: tuple[float, float], t: float) -> tuple[float, float]:
        return (lerp(a[0], b[0], t), lerp(a[1], b[1], t))

    top, right, bottom, left = face
    for u in range(1, cells_u):
        t = u / cells_u
        p0 = lerp_pt(left, top, t)
        p1 = lerp_pt(bottom, right, t)
        draw.line(
            [(int(p0[0]), int(p0[1])), (int(p1[0]), int(p1[1]))],
            fill=cell_b,
            width=1,
        )
    for v in range(1, cells_v):
        t = v / cells_v
        p0 = lerp_pt(top, right, t)
        p1 = lerp_pt(left, bottom, t)
        draw.line(
            [(int(p0[0]), int(p0[1])), (int(p1[0]), int(p1[1]))],
            fill=cell_a,
            width=1,
        )

    # Outer frame
    pts = [(int(x), int(y)) for x, y in face]
    draw.line(pts + [pts[0]], fill=(*frame_col, 230 if premium else 200), width=2 if premium else 1)

    # Specular glint on upper-right facet
    glint = [
        (int(lerp(top[0], right[0], 0.15)), int(lerp(top[1], right[1], 0.15))),
        (int(lerp(top[0], right[0], 0.85)), int(lerp(top[1], right[1], 0.85))),
        (int(lerp(top[0], right[0], 0.55) - 2), int(lerp(top[1], right[1], 0.55) + 2)),
    ]
    draw.polygon(glint, fill=(*PANEL_GLINT, 70 if not premium else 95))

    # Tiny busbar strip near top
    b0 = lerp_pt(top, left, 0.35)
    b1 = lerp_pt(top, right, 0.35)
    draw.line(
        [(int(b0[0]), int(b0[1])), (int(b1[0]), int(b1[1]))],
        fill=(200, 210, 230, 120),
        width=1,
    )

    canvas.alpha_composite(layer)


def draw_chain_fence(
    canvas: Image.Image,
    diamond: list[tuple[int, int]],
    post_h: int = 16,
    front: bool = False,
) -> None:
    """Chain-link fence along diamond edges. back = N-E + N-W; front = S-E + S-W."""
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    n, e, s, w = diamond

    if front:
        segments = [(w, s), (s, e)]
    else:
        segments = [(w, n), (n, e)]

    for (x0, y0), (x1, y1) in segments:
        dist = math.dist((x0, y0), (x1, y1))
        steps = max(4, int(dist / 14))
        posts: list[tuple[int, int]] = []
        for i in range(steps + 1):
            t = i / steps
            px = int(x0 + (x1 - x0) * t)
            py = int(y0 + (y1 - y0) * t)
            posts.append((px, py))
            # Post
            draw.line([(px, py - post_h), (px, py)], fill=(*FENCE_POST, 235), width=2)
            draw.rectangle(
                (px - 2, py - post_h - 1, px + 2, py - post_h + 2),
                fill=(*STEEL_LITE, 230),
            )
        # Top + mid rails
        for dy in (-2, -post_h // 2, -post_h + 1):
            rail = [(p[0], p[1] + dy) for p in posts]
            draw.line(rail, fill=(*FENCE, 200), width=1)
        # Diamond mesh hatch between posts
        for i in range(len(posts) - 1):
            ax, ay = posts[i]
            bx, by = posts[i + 1]
            for k in range(3):
                t = (k + 1) / 4
                mx = int(ax + (bx - ax) * t)
                my = int(ay + (by - ay) * t)
                # X of mesh
                draw.line(
                    [(mx - 4, my - post_h + 3), (mx + 4, my - 3)],
                    fill=(130, 138, 150, 110),
                    width=1,
                )
                draw.line(
                    [(mx + 4, my - post_h + 3), (mx - 4, my - 3)],
                    fill=(130, 138, 150, 90),
                    width=1,
                )

    canvas.alpha_composite(layer)


def layout_panel_grid(
    canvas: Image.Image,
    origin_x: float,
    origin_y: float,
    cols: int,
    rows: int,
    step_x: float,
    step_y: float,
    iso_skew: float,
    hw: float,
    hh: float,
    premium: bool,
) -> None:
    """Place a staggered isometric grid of panels (back rows first)."""
    for row in range(rows):
        for col in range(cols):
            px = origin_x + col * step_x + row * iso_skew
            py = origin_y + row * step_y
            draw_iso_panel(canvas, px, py, hw=hw, hh=hh, premium=premium)


def build_pv_farm(premium: bool, size: tuple[int, int] = (280, 200)) -> Image.Image:
    W, H = size
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx, cy = W // 2, H // 2 + 28
    rx, ry = 118, 48
    diamond = draw_gravel_pad(canvas, cx, cy, rx, ry, gold_accent=premium, seed=77 if premium else 42)

    # Back fence first
    draw_chain_fence(canvas, diamond, post_h=15, front=False)

    if premium:
        # Denser 3-cluster layout
        layout_panel_grid(
            canvas, cx - 78, cy - 58, cols=4, rows=2,
            step_x=28, step_y=16, iso_skew=4, hw=13, hh=7.5, premium=True,
        )
        layout_panel_grid(
            canvas, cx - 20, cy - 50, cols=4, rows=2,
            step_x=28, step_y=16, iso_skew=4, hw=13, hh=7.5, premium=True,
        )
        layout_panel_grid(
            canvas, cx - 52, cy - 28, cols=5, rows=2,
            step_x=26, step_y=15, iso_skew=3.5, hw=12, hh=7, premium=True,
        )
        # Gold corner brackets on pad
        accent = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ad = ImageDraw.Draw(accent)
        g = (*GOLD, 220)
        ad.line([(cx - 52, cy + 18), (cx - 30, cy + 28)], fill=g, width=2)
        ad.line([(cx + 30, cy + 28), (cx + 52, cy + 18)], fill=g, width=2)
        ad.ellipse((cx - 55, cy + 15, cx - 49, cy + 21), fill=g)
        ad.ellipse((cx + 49, cy + 15, cx + 55, cy + 21), fill=g)
        canvas.alpha_composite(accent)
    else:
        layout_panel_grid(
            canvas, cx - 72, cy - 52, cols=4, rows=2,
            step_x=30, step_y=17, iso_skew=4, hw=13.5, hh=7.5, premium=False,
        )
        layout_panel_grid(
            canvas, cx - 28, cy - 40, cols=4, rows=2,
            step_x=30, step_y=17, iso_skew=4, hw=13.5, hh=7.5, premium=False,
        )
        # Small third accent row
        layout_panel_grid(
            canvas, cx - 40, cy - 18, cols=3, rows=1,
            step_x=30, step_y=16, iso_skew=3, hw=12, hh=7, premium=False,
        )

    # Front fence last
    draw_chain_fence(canvas, diamond, post_h=14, front=True)

    # Gate gap hint on south edge
    gate = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(gate)
    gd.line([(cx - 10, cy + ry - 2), (cx + 10, cy + ry - 2)], fill=(*STEEL_LITE, 200), width=2)
    gate_col = GOLD if premium else STEEL_LITE
    gd.rectangle((cx - 3, cy + ry - 12, cx + 3, cy + ry - 4), fill=(*gate_col, 200))
    canvas.alpha_composite(gate)

    return canvas


def build_pv_group(size: tuple[int, int] = (160, 120)) -> Image.Image:
    """Single array cluster for props / build icons."""
    W, H = size
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx, cy = W // 2, H // 2 + 16
    rx, ry = 68, 30
    diamond = draw_gravel_pad(canvas, cx, cy, rx, ry, gold_accent=False, seed=19)
    draw_chain_fence(canvas, diamond, post_h=12, front=False)
    # Dense filled cluster — back row then front (no hollow centre)
    layout_panel_grid(
        canvas, cx - 42, cy - 36, cols=4, rows=2,
        step_x=20, step_y=12, iso_skew=2.5, hw=10.5, hh=6.2, premium=False,
    )
    layout_panel_grid(
        canvas, cx - 32, cy - 18, cols=3, rows=2,
        step_x=20, step_y=12, iso_skew=2.5, hw=10.5, hh=6.2, premium=False,
    )
    draw_chain_fence(canvas, diamond, post_h=11, front=True)
    return canvas


def extract_tech() -> Image.Image:
    """Extract idle frame from worker_sheet.png → transparent, ~2x nearest."""
    sheet = Image.open(ASSET / "worker_sheet.png").convert("RGB")
    # Sheet: 7 rows × 4 cols of ~17×30 sprites. Idle = row0 col0.
    # Non-white content starts y≈2; first char x≈2–18
    frame = sheet.crop((2, 2, 19, 32))
    # Color-key white (and near-white) → alpha
    rgba = frame.convert("RGBA")
    pixels = rgba.load()
    assert pixels is not None
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            if r > 245 and g > 245 and b > 245:
                pixels[x, y] = (0, 0, 0, 0)
            elif r > 230 and g > 230 and b > 230 and abs(r - g) < 8 and abs(g - b) < 8:
                # Soft fringe near white
                pixels[x, y] = (r, g, b, max(0, 255 - (r + g + b) // 3 + 40))

    # Trim to opaque content
    alpha = rgba.split()[3]
    bbox = alpha.getbbox()
    if bbox:
        l, t, r, b = bbox
        rgba = rgba.crop((max(0, l - 1), max(0, t - 1), min(rgba.width, r + 1), min(rgba.height, b + 1)))

    # Scale ~2x nearest-neighbor for crisp pixels
    scaled = rgba.resize((rgba.width * 2, rgba.height * 2), Image.Resampling.NEAREST)
    return scaled


def main() -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    outputs = {
        "pv_bargain.png": build_pv_farm(premium=False, size=(280, 200)),
        "pv_premium.png": build_pv_farm(premium=True, size=(280, 200)),
        "pv_group.png": build_pv_group(size=(160, 120)),
        "tech.png": extract_tech(),
    }
    for name, im in outputs.items():
        path = ASSET / name
        im.save(path, "PNG")
        im.save(PREVIEW / name, "PNG")
        # Quick opaque-pixel color sanity for solar
        if name.startswith("pv_"):
            opaque = [p for p in im.getdata() if p[3] > 200]
            blues = sum(1 for r, g, b, a in opaque if b > r and b > g and b > 100)
            print(f"Wrote {path} {im.size[0]}x{im.size[1]}  blue-ish opaque≈{blues}/{len(opaque)}")
        else:
            print(f"Wrote {path} {im.size[0]}x{im.size[1]}")


if __name__ == "__main__":
    main()
