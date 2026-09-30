#!/usr/bin/env python3
"""Generate tech_walk_0/1.png from tech.png — swapped leg poses."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSET = ROOT / "public" / "assets" / "game"
PREVIEW = Path("/tmp/sprite_preview")


def make_walk_frame(base: Image.Image, left_forward: bool) -> Image.Image:
    """Swap leg poses: left leg forward vs right leg forward."""
    frame = base.copy()
    w, h = frame.size
    pixels = frame.load()
    assert pixels is not None

    # Leg region: roughly y=38..h for 34×60 tech sprite
    leg_top = int(h * 0.62)
    leg_bot = h - 1
    mid_x = w // 2

    # Extract leg columns
    left_leg = base.crop((0, leg_top, mid_x, leg_bot + 1))
    right_leg = base.crop((mid_x, leg_top, w, leg_bot + 1))

    # Clear leg area
    for y in range(leg_top, leg_bot + 1):
        for x in range(w):
            pixels[x, y] = (0, 0, 0, 0)

    if left_forward:
        # Left leg forward (up 3px), right leg back (down 2px)
        frame.paste(right_leg, (mid_x, leg_top + 2), right_leg)
        frame.paste(left_leg, (0, leg_top - 3), left_leg)
    else:
        frame.paste(left_leg, (0, leg_top + 2), left_leg)
        frame.paste(right_leg, (mid_x, leg_top - 3), right_leg)

    return frame


def main() -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    tech = Image.open(ASSET / "tech.png").convert("RGBA")
    frames = {
        "tech_walk_0.png": make_walk_frame(tech, left_forward=True),
        "tech_walk_1.png": make_walk_frame(tech, left_forward=False),
    }
    for name, im in frames.items():
        path = ASSET / name
        im.save(path, "PNG")
        im.save(PREVIEW / name, "PNG")
        print(f"Wrote {path} ({im.size[0]}x{im.size[1]})")


if __name__ == "__main__":
    main()
