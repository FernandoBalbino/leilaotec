"""Recorta as folhas 3x3 geradas por IA em imagens PNG/WebP sem fundo, uma por item.

Uso: python scripts/cut-sprites.py <pasta-com-sheet1..6.png>
A ordem dos itens vem de shared/catalog.ts (9 por folha, linha a linha).
"""

import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "web" / "public" / "items"
THUMB = OUT / "thumb"

ids = re.findall(r"^\s*i\('([^']+)'", (ROOT / "shared" / "catalog.ts").read_text("utf-8"), re.M)
assert len(ids) == 54, f"esperava 54 itens, achei {len(ids)}"


def background_mask(rgb: np.ndarray) -> np.ndarray:
    """Branco conectado à borda da célula (flood fill por dilatação limitada)."""
    lo = rgb.min(axis=2)
    spread = rgb.max(axis=2) - lo
    white = (lo >= 246) & (spread <= 10)
    light = (lo >= 185) & (spread <= 18)
    # Sombra suave = cinza claro que muda devagar; borda de objeto muda de repente e para o preenchimento.
    dv = np.abs(rgb[1:] - rgb[:-1]).max(axis=2) <= 5
    dh = np.abs(rgb[:, 1:] - rgb[:, :-1]).max(axis=2) <= 5
    down, up = white[1:] | (light[1:] & dv), white[:-1] | (light[:-1] & dv)
    right, left = white[:, 1:] | (light[:, 1:] & dh), white[:, :-1] | (light[:, :-1] & dh)
    mask = np.zeros_like(white)
    mask[0, :], mask[-1, :], mask[:, 0], mask[:, -1] = white[0, :], white[-1, :], white[:, 0], white[:, -1]
    count = -1
    while True:
        for _ in range(16):
            grown = mask.copy()
            grown[1:] |= mask[:-1] & down
            grown[:-1] |= mask[1:] & up
            grown[:, 1:] |= mask[:, :-1] & right
            grown[:, :-1] |= mask[:, 1:] & left
            mask = grown
        total = int(mask.sum())
        if total == count:
            return mask
        count = total


def main_parts(obj: np.ndarray) -> np.ndarray:
    """Mantém só os pedaços grandes do objeto (descarta fiapos da célula vizinha)."""
    f = max(1, obj.shape[0] // 170)
    h, w = obj.shape[0] // f, obj.shape[1] // f
    small = obj[: h * f, : w * f].reshape(h, f, w, f).any(axis=(1, 3))
    label = np.zeros((h, w), np.int32)
    sizes = [0]
    for y0, x0 in zip(*np.nonzero(small)):
        if label[y0, x0]:
            continue
        sizes.append(0)
        n = len(sizes) - 1
        stack = [(y0, x0)]
        label[y0, x0] = n
        while stack:
            y, x = stack.pop()
            sizes[n] += 1
            for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= yy < h and 0 <= xx < w and small[yy, xx] and not label[yy, xx]:
                    label[yy, xx] = n
                    stack.append((yy, xx))
    biggest = max(sizes)
    keep = np.isin(label, [k for k, s in enumerate(sizes) if k and s >= biggest * 0.1])
    keep = np.asarray(Image.fromarray(keep.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(3))) > 0
    full = np.zeros_like(obj)
    full[: h * f, : w * f] = keep.repeat(f, axis=0).repeat(f, axis=1)
    return full


def cut(cell: Image.Image) -> Image.Image:
    rgb = np.asarray(cell.convert("RGB")).astype(np.float32)
    bg = background_mask(rgb)
    bg |= ~main_parts(~bg)
    alpha = np.where(bg, 0.0, 1.0)
    # Faixa de 3px da borda: "desmistura" o branco para não sobrar halo claro no fundo escuro.
    near = np.asarray(Image.fromarray((bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
    band = near & ~bg
    a = np.clip((255 - rgb.min(axis=2)) / 200.0, 0, 1)
    alpha[band] = a[band]
    safe = np.maximum(alpha, 1e-3)[..., None]
    color = np.where(band[..., None], np.clip((rgb - (1 - alpha[..., None]) * 255) / safe, 0, 255), rgb)
    rgba = np.dstack([color, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    box = Image.fromarray((alpha > 0.05).astype(np.uint8) * 255).getbbox()
    img = img.crop(box)
    side = int(max(img.size) * 1.08)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    return square


def main(src: Path) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    THUMB.mkdir(parents=True, exist_ok=True)
    preview = Image.new("RGBA", (9 * 120, 6 * 120), (18, 20, 32, 255))
    for s in range(6):
        sheet = Image.open(src / f"sheet{s + 1}.png").convert("RGB")
        w, h = sheet.size
        for k in range(9):
            r, c = divmod(k, 3)
            cell = sheet.crop((c * w // 3, r * h // 3, (c + 1) * w // 3, (r + 1) * h // 3))
            item = cut(cell)
            name = ids[s * 9 + k]
            item.resize((512, 512), Image.LANCZOS).save(OUT / f"{name}.webp", quality=88, method=6)
            small = item.resize((160, 160), Image.LANCZOS)
            small.save(THUMB / f"{name}.webp", quality=85, method=6)
            preview.alpha_composite(small.resize((112, 112), Image.LANCZOS), (k * 120 + 4, s * 120 + 4))
    preview.save(src / "preview.png")
    print("ok", len(ids), "itens ->", OUT)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
