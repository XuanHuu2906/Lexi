"""Rasterize the existing Lexi web icon's paths; no new branding or AI asset.

Run: python scripts/generate-app-icon.py (requires Pillow).
The iOS icon is opaque and square; iOS supplies the corner mask.
"""
from pathlib import Path
from PIL import Image, ImageDraw

size, scale = 1024, 3
image = Image.new('RGB', (size * scale, size * scale), '#6C4BF5')
draw = ImageDraw.Draw(image)
# Same language glyph paths as frontend/public/icon.svg.
paths = [
    [(5, 8), (11, 14)], [(4, 14), (10, 8), (12, 5)],
    [(2, 5), (14, 5)], [(7, 2), (8, 2)],
    [(22, 22), (17, 12), (12, 22)], [(14, 18), (20, 18)],
]
width = 40 * scale
radius = width / 2
for path in paths:
    points = [((272 + x * 20) * scale, (272 + y * 20) * scale) for x, y in path]
    draw.line(points, fill='white', width=width, joint='curve')
    for x, y in points:
        draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill='white')
dest = Path(__file__).resolve().parents[1] / 'Resources' / 'AppIcon.png'
image.resize((size, size), Image.Resampling.LANCZOS).save(dest)
print(f'Created {dest.name}: {size}x{size} RGB')
