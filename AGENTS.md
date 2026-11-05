# AGENTS.md — LeilãoTEC

Jogo de leilão em tempo real para turmas do técnico em Manutenção e Suporte de Informática. Professor na TV, alunos em Chromebook. Textos em português com acentos.

## Arquitetura
- `shared/` é a fonte da verdade (catálogo, pesos, tempos, tipos do protocolo) e é importado pelo servidor e pela web.
- `server/game.ts` tem só regras, com relógio injetável (`Clock`). Teste toda regra nova em `tests/game.test.ts` com o `fakeClock`.
- O servidor é autoritativo: valida saldo, lance mínimo, um lance secreto por aluno e o limite de 6 lances a cada 2 s.
- **Lance secreto:** o valor nunca sai do servidor antes do fim (`Bid.amount = null`). Não exponha `room.sealed` em `view()`.
- O resultado final é calculado no navegador com `rankPlayers`, e o aluno só o vê depois de `revealed`.
- **Missões:** também são secretas. Cada aluno recebe a dele pelo evento `mission` (só no próprio socket), e `view().missions` só aparece com `phase === 'finished'`. A pontuação da missão usa `scoreBuild(itens, missão)` (`focus`/`skip`/`extras`).
- **Perguntas finais:** `buildQuestions` (shared) gera o texto a partir de `history` e do ranking. O servidor guarda as respostas (`submitAnswers`), e só o professor lê (`teacher:answers`). O estado público tem apenas `answered`.
- **Nova partida:** `game.restart` reaproveita a sala e os alunos e zera saldo, peças, roleta, respostas e missões.
- Eventos: `state` (estado completo, agrupado por microtask) e `bid` (incremental). Mantenha os payloads pequenos (banda do Render).

## Regras de produto
- Lance inicial nunca passa de R$ 700 (há teste para isso).
- Os nomes das peças ficam simples (sem termos técnicos complicados).
- Durante o leilão não há dica do que cada peça faz (o aluno precisa reconhecer). As explicações (`Slot.why`) só aparecem na apresentação final.
- Imagens: mesmo estilo 3D, sem fundo, 512px + miniatura de 160px em WebP. Gere uma folha 3×3 com o mesmo prompt-base (`docs/image-prompts.md`) e recorte com `scripts/cut-sprites.py`. A ordem dos itens no catálogo segue as folhas.

## Desempenho (Chromebook)
- Anime só `transform`/`opacity`. A roleta gira com `rotate` em uma única camada (`will-change`), via rAF sincronizado com o relógio do servidor.
- Respeite `prefers-reduced-motion`.

## Verificação
`npm run check && npm test && npm run build`, e depois `npm run e2e` com servidor e Vite locais. Em produção, faça só teste leve (`E2E_URL=... ALUNOS=1`), porque a banda do Render é limitada.
