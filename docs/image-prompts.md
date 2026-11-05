# Prompts das imagens

Modelo: **gpt-image-2.5-sunburst**, 1:1. As folhas 1 e 5 foram geradas no ElevenLabs (2048 px) e as folhas 2, 3, 4 e 6 no Figma AI (1024 px), porque o plano grátis do ElevenLabs atingiu o limite diário. É o mesmo modelo e o mesmo prompt-base, então o estilo é igual.

## Prompt-base (igual em todas as folhas)

> A 3x3 grid sprite sheet of nine separate computer hardware objects for an educational game. All nine share exactly the same art style: polished semi-realistic 3D product render, soft studio lighting from the upper left, gentle specular highlights, clean crisp edges, saturated but natural colors, same camera angle (three-quarter view from slightly above), each object scaled to fill about 70% of its cell and perfectly centered in its cell, with wide empty white margins so no object touches another object. Pure flat white background (#FFFFFF) everywhere, no floor, no drop shadows, no reflections, no grid lines, no borders, no text, no numbers, no letters, no logos, no brand names.

Em seguida vêm as 3 linhas, da esquerda para a direita, na mesma ordem de `ITEMS` em `shared/catalog.ts` (9 itens por folha). Evite objetos brancos, porque o recorte remove o branco ligado à borda.

## Recorte

```bash
python scripts/cut-sprites.py <pasta com sheet1.png … sheet6.png>
```

O script remove o branco e a sombra suave ligados à borda de cada célula, tira o halo claro da borda, descarta fiapos da célula vizinha e salva `web/public/items/<id>.webp` (512 px) e `thumb/<id>.webp` (160 px).

Para trocar ou adicionar uma peça: gere uma folha nova com o prompt-base, ajuste a lista em `catalog.ts` (múltiplo de 9 por folha) e rode o script.
