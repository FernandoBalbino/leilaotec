# Vídeo: como funciona o LeilãoTEC

Vídeo para a TV da sala (1920×1080, 30 fps, cerca de 2min40), feito em Remotion. É o último slide de `/slide`, logo antes de a turma jogar.

**Ideia central:** cada aluno é um técnico de informática que precisa montar o computador mais funcional da turma, comprando as peças num leilão. O vídeo explica entrar na sala, a roleta, os lances (Cobrir, +R$ 50, +R$ 100), o lance secreto, a pontuação, o modo Missão do cliente e simula uma partida (a Ana leva o processador; o Bruno gasta tudo numa cadeira gamer).

## Voz no ElevenLabs

- **Voz:** Amanndev (ID `VnO7flSpwktZAgGGSQ2V`), a mesma do Agência TI e do OSLINUX.
- **Modelo:** Eleven v4 (`eleven_v4`). Ele entende as marcações `[excited]` e `[laughs]`. Se gerar com o Eleven Multilingual v2, apague as marcações.
- **Ajustes sugeridos:** Stability 45–50 %, Similarity 75 %, Style 20 %.
- **Pronúncia:** "LeilãoTEC" está escrito "Leilão Tec" e "TV" está escrito "tevê", como se fala. Na tela aparece certo.
- **Tamanho:** cerca de 2.200 caracteres no total, em 10 falas.

## Onde salvar cada áudio

Salve em **`video/public/voice/`**, com exatamente o nome da tabela, em `.mp3`.

| Arquivo | Cena | Texto da narração |
|---|---|---|
| `s1.mp3` | Abertura | [excited] Fala, turma! Bem-vindos ao Leilão Tec! Hoje cada um de vocês é um técnico de informática com uma missão: montar o computador mais funcional da turma. O detalhe? As peças vão ser compradas num leilão! |
| `s2.mp3` | Entrar na sala | Para entrar, abra o site, digite o código de quatro letras que aparece na tevê e o seu nome. Cada um ganha um avatar colorido e um saldo para gastar. Mas atenção: dinheiro gasto não volta! |
| `s3.mp3` | Roleta | A roleta gira e sorteia uma peça. Pode sair um processador, uma memória, um monitor... ou uma cadeira gamer! [laughs] A peça aparece grande na tevê, com o lance inicial, e o leilão começa. |
| `s4.mp3` | Lances | Vocês têm um minuto para dar lances, e todo mundo vê o lance de todo mundo. Clique em Cobrir para passar o maior lance por dez reais, ou em mais cinquenta e mais cem. Acabou o tempo? Vendido! A peça vai para quem deu o maior lance, e o valor sai do seu saldo. |
| `s5.mp3` | Lance secreto | Peça com cadeado é lance secreto! Cada um manda um lance só, às escondidas, e ninguém vê o lance dos outros. No fim, a tevê revela tudo, do menor para o maior. Quem ofereceu mais leva. |
| `s6.mp3` | Pontos | No final, o que importa é o computador funcionar. As peças que fazem o computador ligar valem mais pontos. Peça repetida não soma: só conta a melhor. E acessório não faz computador ligar. [laughs] Cadeira gamer não roda jogo nenhum! Empatou? Ganha quem economizou mais. |
| `s7.mp3` | Missão do cliente | Às vezes o professor liga o modo Missão do cliente. Aí você recebe um cliente secreto, como a Dona Cida, que só quer fazer videochamada com os netos. Peça que o cliente não usa não conta, e cada acessório que ele pediu vale pontos. Leia a dica com atenção! |
| `s8.mp3` | Partida de exemplo | Bora ver uma partida? Sai um processador, com lance inicial de quatrocentos e cinquenta reais. A Ana dá o lance, o Bruno cobre... e a Ana dá mais cinquenta e leva por quinhentos e dez! Depois sai uma cadeira gamer, e o Bruno gasta quinhentos nela. [laughs] Bruno, cadeira não liga computador! |
| `s9.mp3` | Resultado e pódio | Quando a partida acaba, a tevê mostra o computador de cada um, do menor para o maior, com as peças que faltaram. O Bruno chegou a quarenta por cento... e a Ana, a noventa! Depois vem o pódio! |
| `s10.mp3` | Encerramento | Resumindo: escute o cliente, gaste com cuidado e compre primeiro o essencial. [excited] Preparados? Então... que comece o leilão! |

O texto de cada fala e as marcas de sincronia ficam em `src/script.ts`. Se mudar uma fala, mude lá também.

## Depois de salvar os áudios

Dentro da pasta `video/`:

```bash
npm run voice
```

```bash
npm run render
```

```bash
npm run poster
```

O `npm run voice` mede cada áudio e ajusta o tempo das cenas sozinho. Com `ELEVENLABS_API_KEY` no `.env.local` da raiz, ele também transcreve as falas para as animações caírem na palavra exata. Sem a chave, distribui as marcas pelo tamanho do texto. O vídeo sai em `web/public/video/leilaotec.mp4` e o pôster em `web/public/video/poster.jpg`.

Sem áudio, o vídeo ainda funciona: cada cena dura o tempo estimado da fala.

Para conferir o visual sem renderizar tudo: `node scripts/stills.mts 300 900 1500` salva prints desses quadros em `out/`. O `npm run timeline` mostra em que quadro começa cada cena.

## Sons

- Clique do mouse, whoosh, ding e switch: biblioteca de sons do Remotion (remotion.media), os mesmos do Agência TI e do CYBER WAR. Ficam em `video/public/sfx/`.
- Roleta, item, contagem e lance: os sons do próprio jogo (`web/public/sounds/`), copiados para `video/public/sounds/`.
- Imagens das peças: as mesmas do jogo (`web/public/items/`), copiadas para `video/public/items/`.
