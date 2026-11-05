# Design QA — LeilãoTEC

Prints em `qa-evidence/` (gerados por `npm run e2e` e `node scripts/tv-30.ts`).

| Tela | Verificado | Print |
|---|---|---|
| Sala de espera (TV) | Código gigante com animação, lista de alunos com avatar colorido, botão de remover | `01-lobby-tv.png`, `30-lobby.png` |
| Roleta | Roleta gigante (só a metade de cima aparece), 54 imagens em 2 anéis, cadeado nas secretas, ponteiro batendo nas fatias, luzes piscando | `03-roleta-tv.png` |
| Item sorteado | Fica grande no centro com raios de luz e depois encolhe até o painel | `04-item-grande-tv.png` |
| Lances (TV, 2 e 30 alunos) | Item em destaque, lance inicial, maior lance com avatar, contagem circular (vermelha nos últimos 5 s), cartões com lance grande e peças ganhas | `05-lances-tv.png`, `30-lances.png` |
| Lances (aluno) | Saldo, botões rápidos (lance inicial/cobrir, +50, +100), valor livre; secreto pede confirmação | `06-lances-aluno.png` |
| Vendido / lance secreto | Carimbo VENDIDO!, revelação dos lances secretos do menor para o maior | `07-vendido-tv.png` |
| Apresentação final (TV) | Um aluno por vez, do menor percentual para o maior, com barra vermelho→verde, peças que faltaram e motivo | `09-slide-aluno-tv.png`, `30-slide.png` |
| Pódio | Top 3, confete, ranking com desempate pelo saldo | `10-podio-tv.png`, `30-podio.png` |
| Aluno no final | "Olhe para a TV!" até o professor liberar; depois o pódio e o resultado próprio | `08-aluno-espera-tv.png`, `11-resultado-aluno.png` |

## Critérios
- TV em 1366×768 (notebook espelhado) e 1920×1080. Fonte escala com `vw`.
- Chromebook: só `transform`/`opacity` animados; roleta em uma camada; `prefers-reduced-motion` desliga os movimentos.
- Som: professor começa com som, aluno começa mudo (botão 🔇/🔊).
- Sem dicas sobre a função das peças durante o leilão; as explicações só aparecem no final.
