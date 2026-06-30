#!/usr/bin/env python3
"""Strip baked-in black plates and muscle linework from NewYou logo PNGs.

Interior pec/abs/bicep lines must be transparent cutouts, not black strokes —
otherwise they read as black artifacts on non-black app backgrounds.
"""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

BLACK_THRESH = 40
MIN_BACKGROUND_COMPONENT = 100

REPO_ROOT = Path(__file__).resolve().parent.parent

LOGO_PATHS = [
    REPO_ROOT / "apps/mobile/assets/images/newyou-mark.png",
    REPO_ROOT / "apps/mobile/assets/images/newyou-logo.png",
    REPO_ROOT / "apps/mobile/assets/images/splash-icon.png",
    REPO_ROOT / "apps/mobile/assets/images/favicon.png",
    REPO_ROOT / "apps/mobile/assets/images/android-icon-foreground.png",
    REPO_ROOT / "apps/mobile/assets/images/android-icon-monochrome.png",
    REPO_ROOT / "apps/mobile/assets/images/icon.png",
    REPO_ROOT / "apps/pwa/public/newyou-logo.png",
    REPO_ROOT / "apps/pwa/src/assets/newyou-logo.png",
    REPO_ROOT / "apps/pwa/public/favicon.png",
    REPO_ROOT / "apps/pwa/public/icon-192.png",
]


def is_black_pixel(r: int, g: int, b: int, a: int) -> bool:
    return a > 128 and r <= BLACK_THRESH and g <= BLACK_THRESH and b <= BLACK_THRESH


def is_gold_pixel(r: int, g: int, b: int, a: int) -> bool:
    """Tan/gold muscle fill plus its edge anti-aliasing — keep these opaque."""
    if a <= 128:
        return False
    return (
        r >= 60
        and g >= 45
        and b >= 28
        and r >= g >= b
        and (r - b) >= 15
    )


def normalize_transparent_rgb(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0:
                px[x, y] = (0, 0, 0, 0)
    return rgba


def remove_black_background(im: Image.Image) -> tuple[Image.Image, int]:
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()

    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []

    for sy in range(h):
        for sx in range(w):
            if not is_black_pixel(*px[sx, sy]) or (sx, sy) in visited:
                continue
            q: deque[tuple[int, int]] = deque([(sx, sy)])
            comp: list[tuple[int, int]] = []
            visited.add((sx, sy))
            while q:
                x, y = q.popleft()
                comp.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                        if is_black_pixel(*px[nx, ny]):
                            visited.add((nx, ny))
                            q.append((nx, ny))
            components.append(comp)

    removed = 0
    for comp in components:
        if len(comp) < MIN_BACKGROUND_COMPONENT:
            continue
        for x, y in comp:
            px[x, y] = (0, 0, 0, 0)
            removed += 1

    return rgba, removed


def remove_dark_linework(im: Image.Image) -> tuple[Image.Image, int]:
    """Turn interior black strokes and dark edge halos into transparent cutouts."""
    rgba = im.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    removed = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a <= 128 or is_gold_pixel(r, g, b, a):
                continue
            px[x, y] = (0, 0, 0, 0)
            removed += 1
    return rgba, removed


def to_monochrome_white(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 0:
                px[x, y] = (255, 255, 255, a)
    return rgba


def process_file(path: Path, monochrome: bool = False) -> None:
    if not path.is_file():
        print(f"skip missing {path}")
        return

    with Image.open(path) as src:
        cleaned, bg_removed = remove_black_background(src)
        cleaned, line_removed = remove_dark_linework(cleaned)
        if monochrome:
            cleaned = to_monochrome_white(cleaned)
        cleaned = normalize_transparent_rgb(cleaned)
        cleaned.save(path, "PNG")

    with Image.open(path) as verify:
        rgba = verify.convert("RGBA")
        w, h = rgba.size
        px = rgba.load()
        transparent = sum(1 for y in range(h) for x in range(w) if px[x, y][3] == 0)
        black_left = sum(
            1
            for y in range(h)
            for x in range(w)
            if px[x, y][3] > 128 and px[x, y][0] < 40 and px[x, y][1] < 40 and px[x, y][2] < 40
        )
        dark_left = sum(
            1
            for y in range(h)
            for x in range(w)
            if px[x, y][3] > 128 and not is_gold_pixel(*px[x, y])
        )
    print(
        f"{path.relative_to(REPO_ROOT)}: removed bg={bg_removed} line={line_removed}, "
        f"transparent={transparent}/{w * h}, black_left={black_left}, dark_left={dark_left}"
    )


def main() -> int:
    for rel in LOGO_PATHS:
        monochrome = "monochrome" in rel.name
        process_file(rel, monochrome=monochrome)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
