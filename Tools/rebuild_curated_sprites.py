#!/usr/bin/env python3
"""Rebuild curated Megawatt Valley game sprites with Pillow composites."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "game"


def load_crop(name: str, pad: int = 2) -> Image.Image:
    """Load RGBA sprite and crop to opaque content."""
    im = Image.open(ASSET / name).convert("RGBA")
    alpha = im.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def scale_to_width(im: Image.Image, width: int) -> Image.Image:
    if im.width == width:
        return im
    h = max(1, round(im.height * (width / im.width)))
    return im.resize((width, h), Image.Resampling.LANCZOS)


def scale_to_height(im: Image.Image, height: int) -> Image.Image:
    if im.height == height:
        return im
    w = max(1, round(im.width * (height / im.height)))
    return im.resize((w, height), Image.Resampling.LANCZOS)


def paste(dst: Image.Image, src: Image.Image, xy: tuple[int, int]) -> None:
    dst.alpha_composite(src, dest=xy)


def soft_shadow(
    size: tuple[int, int],
    blur: float = 6.0,
    opacity: int = 90,
    squash: float = 0.45,
) -> Image.Image:
    """Elliptical soft drop shadow matching approximate sprite footprint."""
    w, h = size
    sh = Image.new("RGBA", (w + 24, max(8, int(h * squash) + 24)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sh)
    pad = 12
    draw.ellipse(
        (pad, pad, w + pad, int(h * squash) + pad),
        fill=(0, 0, 0, opacity),
    )
    return sh.filter(ImageFilter.GaussianBlur(blur))


def draw_gravel_diamond(
    canvas: Image.Image,
    cx: int,
    cy: int,
    rx: int,
    ry: int,
    gold_accent: bool = False,
) -> None:
    """Isometric-looking gravel pad: diamond polygon + filled ellipse + speckles."""
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    # Soft ground shadow under pad
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((cx - rx - 4, cy - ry + 6, cx + rx + 4, cy + ry + 10), fill=(40, 30, 20, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(5))
    canvas.alpha_composite(shadow)

    # Diamond polygon (isometric rhombus)
    diamond = [
        (cx, cy - ry - 4),
        (cx + rx + 8, cy),
        (cx, cy + ry + 4),
        (cx - rx - 8, cy),
    ]
    # Outer rim (darker gravel edge)
    draw.polygon(diamond, fill=(118, 108, 92, 255))
    # Inner ellipse body
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(168, 156, 132, 255))
    # Slight highlight band on upper-left of pad
    draw.ellipse(
        (cx - int(rx * 0.72), cy - int(ry * 0.78), cx + int(rx * 0.15), cy + int(ry * 0.05)),
        fill=(188, 176, 150, 90),
    )

    # Gravel speckles
    rng = random.Random(42 if not gold_accent else 77)
    for _ in range(420):
        # Sample points inside ellipse
        ang = rng.random() * math.tau
        rad = math.sqrt(rng.random())
        x = int(cx + math.cos(ang) * rx * rad * 0.95)
        y = int(cy + math.sin(ang) * ry * rad * 0.95)
        tone = rng.randint(-28, 22)
        c = (
            max(0, min(255, 160 + tone)),
            max(0, min(255, 148 + tone)),
            max(0, min(255, 124 + tone)),
            rng.choice([180, 200, 220, 255]),
        )
        s = rng.choice([1, 1, 1, 2])
        draw.rectangle((x, y, x + s, y + s), fill=c)

    # Subtle diamond edge stroke for isometric read
    draw.line(diamond + [diamond[0]], fill=(96, 86, 70, 200), width=2)

    if gold_accent:
        # Subtle gold frame accents at diamond corners
        gold = (212, 168, 58, 230)
        gold_dim = (170, 130, 40, 160)
        for i, (px, py) in enumerate(diamond):
            nx, ny = diamond[(i + 1) % 4]
            # Short accent segments near corners
            t0, t1 = 0.0, 0.22
            ax0 = int(px + (nx - px) * t0)
            ay0 = int(py + (ny - py) * t0)
            ax1 = int(px + (nx - px) * t1)
            ay1 = int(py + (ny - py) * t1)
            draw.line([(ax0, ay0), (ax1, ay1)], fill=gold, width=3)
            t0, t1 = 0.78, 1.0
            ax0 = int(px + (nx - px) * t0)
            ay0 = int(py + (ny - py) * t0)
            ax1 = int(px + (nx - px) * t1)
            ay1 = int(py + (ny - py) * t1)
            draw.line([(ax0, ay0), (ax1, ay1)], fill=gold_dim, width=2)
        # Tiny gold corner studs
        for px, py in diamond:
            draw.ellipse((px - 3, py - 3, px + 3, py + 3), fill=gold)

    canvas.alpha_composite(layer)


def draw_concrete_pad(
    canvas: Image.Image,
    cx: int,
    cy: int,
    rx: int,
    ry: int,
) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((cx - rx - 2, cy - ry + 8, cx + rx + 2, cy + ry + 12), fill=(30, 30, 35, 80))
    canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(4)))

    diamond = [
        (cx, cy - ry - 2),
        (cx + rx + 6, cy),
        (cx, cy + ry + 2),
        (cx - rx - 6, cy),
    ]
    draw.polygon(diamond, fill=(140, 142, 148, 255))
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(186, 188, 194, 255))
    # Pad edge / curb
    draw.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), outline=(120, 122, 128, 220), width=2)
    # Expansion joints
    draw.line([(cx - int(rx * 0.55), cy), (cx + int(rx * 0.55), cy)], fill=(160, 162, 168, 160), width=1)
    draw.line([(cx, cy - int(ry * 0.7)), (cx, cy + int(ry * 0.7))], fill=(160, 162, 168, 140), width=1)
    # Subtle texture
    rng = random.Random(11)
    for _ in range(180):
        ang = rng.random() * math.tau
        rad = math.sqrt(rng.random())
        x = int(cx + math.cos(ang) * rx * rad * 0.9)
        y = int(cy + math.sin(ang) * ry * rad * 0.9)
        tone = rng.randint(-12, 10)
        draw.point((x, y), fill=(186 + tone, 188 + tone, 194 + tone, 200))

    canvas.alpha_composite(layer)


def draw_fence_suggestion(
    canvas: Image.Image,
    points: list[tuple[int, int]],
) -> None:
    """Simple chain-link / post fence along pad edge."""
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    post = (72, 78, 88, 230)
    rail = (110, 118, 130, 200)
    # Back (far) edge of diamond — posts + rails
    for i in range(len(points) - 1):
        x0, y0 = points[i]
        x1, y1 = points[i + 1]
        steps = max(3, int(math.dist((x0, y0), (x1, y1)) / 18))
        posts = []
        for s in range(steps + 1):
            t = s / steps
            px = int(x0 + (x1 - x0) * t)
            py = int(y0 + (y1 - y0) * t)
            posts.append((px, py))
            # Post
            draw.line([(px, py - 14), (px, py)], fill=post, width=2)
            draw.rectangle((px - 2, py - 15, px + 2, py - 12), fill=(90, 96, 108, 230))
        # Double rail
        for dy in (-4, -10):
            rail_pts = [(p[0], p[1] + dy) for p in posts]
            draw.line(rail_pts, fill=rail, width=1)
    # Optional mesh hatch on back segment
    if len(points) >= 2:
        x0, y0 = points[0]
        x1, y1 = points[-1]
        for s in range(1, 8):
            t = s / 8
            px = int(x0 + (x1 - x0) * t)
            py = int(y0 + (y1 - y0) * t)
            draw.line([(px - 3, py - 12), (px + 3, py - 3)], fill=(130, 138, 150, 90), width=1)
    canvas.alpha_composite(layer)


def build_pv(premium: bool) -> Image.Image:
    W, H = 280, 220
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx, cy = W // 2, H // 2 + 30
    rx, ry = 120, 54
    draw_gravel_diamond(canvas, cx, cy, rx, ry, gold_accent=premium)

    group = scale_to_width(load_crop("pv_group.png"), 104 if premium else 96)
    single = scale_to_width(load_crop("pv_single.png"), 50 if premium else 46)
    # Portrait used only as a spaced third row for premium density
    portrait = scale_to_width(load_crop("pv_portrait.png"), 68)

    # Layout: distinct 2–3 clusters (back → front), avoid heavy overlap
    if premium:
        placements = [
            (group, cx - 86, cy - 82),   # back-left
            (group, cx + 10, cy - 76),   # back-right
            (portrait, cx - 42, cy - 48),  # mid-front denser row
            (single, cx + 78, cy - 34),  # side accent
        ]
    else:
        placements = [
            (group, cx - 82, cy - 76),   # back-left
            (group, cx + 6, cy - 64),    # front-right
            (single, cx - 8, cy - 36),   # small mid accent
            (single, cx + 68, cy - 28),  # side accent
        ]

    for sprite, x, y in placements:
        sh = soft_shadow((sprite.width, max(20, sprite.height // 3)), blur=4.5, opacity=55, squash=0.85)
        paste(canvas, sh, (x + 6, y + sprite.height - 12))
        paste(canvas, sprite, (x, y))

    if premium:
        # Extra subtle gold trim brackets near front pad edge
        accent = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        ad = ImageDraw.Draw(accent)
        g = (220, 175, 55, 210)
        ad.line([(cx - 48, cy + 22), (cx - 28, cy + 32)], fill=g, width=2)
        ad.line([(cx + 28, cy + 32), (cx + 48, cy + 22)], fill=g, width=2)
        ad.ellipse((cx - 52, cy + 19, cx - 46, cy + 25), fill=g)
        ad.ellipse((cx + 46, cy + 19, cx + 52, cy + 25), fill=g)
        canvas.alpha_composite(accent)

    return canvas


def build_substation() -> Image.Image:
    W, H = 280, 220
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cx, cy = W // 2, H // 2 + 36
    rx, ry = 112, 48
    draw_concrete_pad(canvas, cx, cy, rx, ry)

    # Fence along far (NW–NE) edges of diamond
    far_left = (cx - rx - 4, cy)
    far_top = (cx, cy - ry - 2)
    far_right = (cx + rx + 4, cy)
    draw_fence_suggestion(canvas, [far_left, far_top])
    draw_fence_suggestion(canvas, [far_top, far_right])

    tank = scale_to_width(load_crop("tank.png"), 78)
    tower = scale_to_height(load_crop("water_tower.png"), 96)
    chimney = scale_to_height(load_crop("chimney.png"), 88)
    container = scale_to_width(load_crop("container.png"), 70)
    fence_bit = scale_to_width(load_crop("fence.png"), 36)

    # Readable industrial yard — spread elements, back to front
    # Keep footprints on pad; leave breathing room between props
    items = [
        (tower, cx + 36, cy - 112),      # back-right landmark
        (chimney, cx - 8, cy - 102),     # back-center
        (tank, cx - 88, cy - 80),        # mid-left hero tank
        (container, cx + 22, cy - 48),   # front-right storage
        (fence_bit, cx - 108, cy - 30),  # near-left fence accent
        (fence_bit, cx + 78, cy - 18),   # near-right fence accent
    ]

    for sprite, x, y in items:
        sh = soft_shadow((sprite.width, sprite.height), blur=5, opacity=75, squash=0.32)
        paste(canvas, sh, (x + 3, y + sprite.height - 14))
        paste(canvas, sprite, (x, y))

    return canvas


def build_office() -> Image.Image:
    W, H = 260, 200
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))

    # Prefer office_mod (red-frame modern office)
    building = load_crop("office_mod.png")
    # Scale building to sit nicely with parking strip
    building = scale_to_width(building, 150)

    # Parking strip: elongated isometric asphalt diamond in front/left of building
    pad = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(pad)
    # Building sits upper-center; parking extends toward bottom-left / front
    bx = (W - building.width) // 2 + 18
    by = 18

    # Ground shadow for whole site
    site_shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(site_shadow)
    sd.ellipse((28, H - 58, W - 20, H - 18), fill=(40, 35, 30, 70))
    canvas.alpha_composite(site_shadow.filter(ImageFilter.GaussianBlur(5)))

    # Parking strip diamond (asphalt)
    pcx, pcy = 78, H - 52
    prx, pry = 70, 28
    parking = [
        (pcx, pcy - pry),
        (pcx + prx, pcy),
        (pcx, pcy + pry),
        (pcx - prx, pcy),
    ]
    draw.polygon(parking, fill=(78, 82, 90, 255))
    # Slight highlight
    draw.ellipse((pcx - 40, pcy - 14, pcx + 10, pcy + 6), fill=(95, 98, 108, 90))
    # Parking stall lines (short dashes along strip length)
    for t in (0.28, 0.5, 0.72):
        mx = int(parking[3][0] + (parking[1][0] - parking[3][0]) * t)
        my = int(parking[3][1] + (parking[1][1] - parking[3][1]) * t)
        # Line runs roughly NW–SE (short axis of diamond)
        draw.line(
            [(mx - 6, my - 10), (mx + 5, my + 8)],
            fill=(220, 220, 210, 210),
            width=1,
        )
    # Curb edge
    draw.line(parking + [parking[0]], fill=(120, 124, 132, 180), width=1)
    canvas.alpha_composite(pad)

    # Soft building shadow
    bsh = soft_shadow((building.width, building.height), blur=6, opacity=80, squash=0.35)
    paste(canvas, bsh, (bx + 6, by + building.height - 20))
    paste(canvas, building, (bx, by))

    # Van on parking strip
    van = scale_to_width(load_crop("van.png"), 42)
    vx, vy = 48, H - 78
    vsh = soft_shadow((van.width, van.height), blur=3.5, opacity=70, squash=0.4)
    paste(canvas, vsh, (vx + 2, vy + van.height - 8))
    paste(canvas, van, (vx, vy))

    return canvas


def main() -> None:
    outputs = {
        "pv_bargain.png": build_pv(premium=False),
        "pv_premium.png": build_pv(premium=True),
        "substation.png": build_substation(),
        "office.png": build_office(),
    }
    for name, im in outputs.items():
        path = ASSET / name
        im.save(path, "PNG")
        print(f"Wrote {path} ({im.size[0]}x{im.size[1]})")
        # Preview copies for visual QA
        im.save(Path("/tmp/sprite_preview") / name, "PNG")


if __name__ == "__main__":
    main()
