# Créditos e licenças

## Imagens das peças (`web/public/items/`)
Geradas por IA para este projeto com o modelo gpt-image-2.5-sunburst, via ElevenLabs (folhas 1 e 5) e Figma AI (folhas 2, 3, 4 e 6), na conta do autor. O recorte sem fundo foi feito com `scripts/cut-sprites.py`. As imagens não contêm logotipos.

Marcas citadas nos nomes das peças (Intel, AMD, NVIDIA, Kingston, Samsung, Logitech etc.) pertencem a seus donos. Elas aparecem só como referência educativa, sem afiliação.

## Sons (`web/public/sounds/`)
Efeitos gerados pelo autor no ElevenLabs Sound Effects (Text to Sound v2), conforme os termos da conta dele.

## Vídeo explicativo (`web/public/video/`, código em `video/`)
- Feito com Remotion (licença Remotion, gratuita para pessoas e equipes de até 3).
- Efeitos sonoros do vídeo (whoosh, clique, ding, switch): biblioteca de sons do Remotion (remotion.media), os mesmos do Agência TI e do CYBER WAR.
- Narração: gerada com ElevenLabs (voz "Amanndev", da biblioteca de vozes da ElevenLabs, modelo Eleven v4), conforme os termos da ElevenLabs.
- Imagens das peças e sons da roleta, do item, da contagem e do lance: os mesmos do jogo (acima).

## Avatares
Silhueta SVG original do projeto (`web/src/ui.tsx`). A cor é sorteada pelo servidor.

## Fontes
- Inter, de Rasmus Andersson: SIL Open Font License 1.1, via Google Fonts.
- Sora, de Jonathan Barnbrook e Julián Moncada: SIL Open Font License 1.1, via Google Fonts.

## Bibliotecas
| Pacote | Licença |
|---|---|
| React, React DOM | MIT |
| Socket.IO (servidor e cliente) | MIT |
| Express | MIT |
| Vite, @vitejs/plugin-react | MIT |
| canvas-confetti | ISC |
| Playwright (só testes) | Apache-2.0 |
| TypeScript (só desenvolvimento) | Apache-2.0 |
