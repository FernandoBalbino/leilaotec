# LeilãoTEC

Leilão de peças de computador em tempo real para a turma. O professor cria a sala e passa na TV. Os alunos entram pelo Chromebook com um saldo fictício. A roleta sorteia uma peça e todo mundo dá lances por 1 minuto. No final, a TV mostra, aluno por aluno, quão **funcional** ficou o computador de cada um.

Atividade de abertura do tema **Empreendedorismo no atendimento** (Suporte Técnico e Atendimento ao Usuário): gastar bem, priorizar o essencial e reconhecer o que cada peça faz.

- **Jogar:** https://fernandobalbino.github.io/leilaotec/
- **Servidor (Render):** https://leilaotec.onrender.com/health

## Antes da partida
1. **Slides na TV:** https://fernandobalbino.github.io/leilaotec/slide. São 8 slides curtos sobre empreendedorismo no atendimento: escutar o cliente, nem mais nem menos, oportunidades de mercado e o dinheiro do cliente. O 9º é o **vídeo de como jogar** (cerca de 2min40, narrado). Use ← → ou espaço, e ⛶ para tela cheia. O vídeo é feito em Remotion na pasta `video/`: o roteiro, a voz e como refazer estão em `video/roteiro.md`.
2. **Trilha no Chromebook:** https://fernandobalbino.github.io/leilaotec/atividade. São 5 missões: 2 sobre o tema, 2 sobre a estratégia do leilão e 1 para lembrar as peças do computador. Copiar e colar ficam bloqueados, e cada missão destrava a próxima com uma dica. No fim, o botão **Entrar na sala do leilão** abre direto o formulário de código e nome. As respostas ficam só no navegador do aluno (não vão para o servidor).

## Como funciona

1. **Professor:** "Sou professor" → escolhe o saldo de cada aluno (R$ 2.000 a 5.000) e o tempo da partida → passa a tela na TV.
2. **Alunos:** entram no mesmo endereço com o código de 4 letras e o nome. Cada um recebe uma cor de avatar.
3. **Roleta (7 s):** sorteia uma das 54 peças. O item aparece grande no meio da tela e depois encolhe até o painel.
4. **Lances (60 s):** todos veem o lance de todos. O lance mínimo é o lance inicial; depois, R$ 10 acima do maior.
5. **🔒 Lance secreto:** cerca de 25% das peças (sorteadas por partida, com cadeado na roleta). Cada aluno dá um lance só, às cegas. Se der empate, o lance é refeito uma vez; se empatar de novo, vence quem mandou primeiro. No fim, a tela revela os valores e o vencedor.
6. **Fim:** quando o tempo da partida acaba (o item em andamento termina primeiro), quando acabam as peças ou quando ninguém tem saldo para o item mais barato.
7. **Apresentação na TV (só na tela do professor):** do menor percentual para o maior, com a barra "Computador funcional" indo do vermelho ao verde, as peças que faltaram e o porquê. Depois vêm o rufar, o pódio e o ranking. O professor libera o resultado para os alunos com "Mostrar resultado para a turma".

### Depois da partida: 5 perguntas
Quando o professor libera o resultado, cada aluno vê 5 perguntas montadas com o que **ele** fez no jogo: quanto gastou em acessórios, quais peças faltaram, a compra mais cara (e quanto pagou acima do lance inicial), a comparação com o vencedor e o que compraria para um cliente. Colar e arrastar texto ficam bloqueados, e cada resposta precisa ter pelo menos 15 letras. No pódio, o professor acompanha "📝 Respostas: X de Y" e lê as respostas de cada aluno.

### Modo "Missão do cliente"
Escolhido ao criar a sala ou na **Nova partida** (que reabre a mesma sala, sem os alunos digitarem o código de novo). Cada aluno recebe um cliente secreto, entre 24 missões (`shared/missions.ts`): gamer, vó das videochamadas, ENEM, podcaster, pro player etc. A missão traz uma história curta e uma dica que não entrega a lista de peças, e fica destacada na tela do aluno durante o jogo.
- A pontuação da missão conta as peças que o cliente precisa. Peça fraca para aquele cliente vale metade (ex.: gamer com placa de vídeo básica). O que ele não precisa sai da conta (a vó não precisa de placa de vídeo). Cada acessório que ele pediu vale 8 pontos.
- Na TV, cada slide mostra a missão, o "Missão cumprida: X%", as peças fracas, os acessórios pedidos e a lição daquele cliente.

### Pontuação

| Peça | Peso |
|---|---|
| Placa-mãe, Processador | 13 cada |
| Memória RAM, HD/SSD, Fonte, Monitor | 10 cada |
| Cooler, Gabinete, Sistema operacional, Placa de vídeo | 6 cada |
| Teclado, Mouse | 5 cada |

Cada peça vale `peso × qualidade` (0,88 a 1). Exemplo: RAM 2GB = 0,88; RAM 32GB Gamer = 1. Peça repetida não soma, conta só a melhor. Acessórios (headset, cadeira gamer, impressora…) valem 0. Um PC completo com as melhores peças dá 100%; sem monitor, dá 90%. Empate no percentual: vence quem economizou mais.

No modo missão a pontuação é a da missão (veja acima). Controles do professor durante o jogo: **Encerrar lances**, **Pausar roleta** (segura o próximo giro), **Encerrar partida**, som e tela cheia. Na apresentação: ← → para navegar e espaço para pausar.

## Desenvolvimento

```bash
npm install
npm run dev:server   # Socket.IO em http://localhost:3000
npm run dev:web      # Vite em http://localhost:5173/leilaotec/
npm run check        # TypeScript
npm test             # regras do leilão e pontuação
npm run e2e          # partida completa no Chrome (professor + 2 alunos), prints em qa-evidence/
node scripts/tv-30.ts        # TV com 30 alunos-robô (só local)
SECRET_SHARE=1 npm start     # todos os itens com lance secreto, para testar
```

- `shared/catalog.ts`: as 54 peças, lances iniciais (máx. R$ 700), pesos e a função `scoreBuild`.
- `shared/missions.ts`: as 24 missões. `shared/questions.ts`: as 5 perguntas personalizadas.
- `server/game.ts`: as regras (sem rede). `server/index.ts`: Express + Socket.IO.
- `web/`: React + Vite. Imagens em `web/public/items/`, sons em `web/public/sounds/`.
- Imagens: `scripts/cut-sprites.py` recorta as folhas 3×3 geradas por IA (prompts em `docs/image-prompts.md`).

## Produção

- **GitHub Pages** (`.github/workflows/pages.yml`): a cada push em `main`, roda tipos e testes, faz o build e publica `dist/`. A URL do servidor vem da variável de repositório `VITE_SERVER_URL`.
- **Render** (`render.yaml`, plano free): `npm ci --omit=dev` + `node server/index.ts` (Node 24 roda TypeScript direto). Ele só troca mensagens pequenas; imagens e sons saem do GitHub Pages, o que poupa a banda do Render. O plano grátis dorme depois de 15 min sem uso: a página inicial já acorda o servidor, e a tela do professor manda um ping a cada 4 min durante a aula.
- Salas ficam na memória do servidor (somem se ele reiniciar) e são apagadas após 4 h paradas.
