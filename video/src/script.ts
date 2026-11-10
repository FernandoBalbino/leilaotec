// Roteiro do vídeo: uma fala por cena (public/voice/sN.mp3) e as marcas onde cada animação entra.
// "a|b" = alternativas para achar o trecho na transcrição. [excited]/[laughs] são marcações do Eleven v4.
export const SCENES: { id: string; text: string; cues: Record<string, string> }[] = [
  {
    id: 's1',
    text: '[excited] Fala, turma! Bem-vindos ao Leilão Tec! Hoje cada um de vocês é um técnico de informática com uma missão: montar o computador mais funcional da turma. O detalhe? As peças vão ser compradas num leilão!',
    cues: { logo: 'Leilão Tec', tech: 'técnico', pc: 'computador mais funcional', detail: 'O detalhe', auction: 'compradas num leilão' },
  },
  {
    id: 's2',
    text: 'Para entrar, abra o site, digite o código de quatro letras que aparece na tevê e o seu nome. Cada um ganha um avatar colorido e um saldo para gastar. Mas atenção: dinheiro gasto não volta!',
    cues: { site: 'abra o site', code: 'código de quatro letras|código de 4 letras', name: 'seu nome', avatar: 'avatar colorido', balance: 'saldo para gastar', warn: 'dinheiro gasto' },
  },
  {
    id: 's3',
    text: 'A roleta gira e sorteia uma peça. Pode sair um processador, uma memória, um monitor... ou uma cadeira gamer! [laughs] A peça aparece grande na tevê, com o lance inicial, e o leilão começa.',
    cues: { spin: 'roleta gira', cpu: 'um processador', ram: 'uma memória', mon: 'um monitor', chair: 'cadeira gamer', big: 'aparece grande', start: 'lance inicial' },
  },
  {
    id: 's4',
    text: 'Vocês têm um minuto para dar lances, e todo mundo vê o lance de todo mundo. Clique em Cobrir para passar o maior lance por dez reais, ou em mais cinquenta e mais cem. Acabou o tempo? Vendido! A peça vai para quem deu o maior lance, e o valor sai do seu saldo.',
    cues: { minute: 'um minuto|1 minuto', all: 'todo mundo vê', cover: 'Cobrir', p50: 'mais cinquenta|mais 50', p100: 'mais cem|mais 100', end: 'Acabou o tempo', sold: 'Vendido', pay: 'sai do seu saldo' },
  },
  {
    id: 's5',
    text: 'Peça com cadeado é lance secreto! Cada um manda um lance só, às escondidas, e ninguém vê o lance dos outros. No fim, a tevê revela tudo, do menor para o maior. Quem ofereceu mais leva.',
    cues: { lock: 'cadeado', one: 'um lance só', hidden: 'ninguém vê', reveal: 'revela tudo', win: 'Quem ofereceu mais' },
  },
  {
    id: 's6',
    text: 'No final, o que importa é o computador funcionar. As peças que fazem o computador ligar valem mais pontos. Peça repetida não soma: só conta a melhor. E acessório não faz computador ligar. [laughs] Cadeira gamer não roda jogo nenhum! Empatou? Ganha quem economizou mais.',
    cues: { work: 'computador funcionar', main: 'fazem o computador ligar', repeat: 'repetida', best: 'só conta a melhor', acc: 'acessório não', chair: 'Cadeira gamer', tie: 'Empatou', save: 'economizou' },
  },
  {
    id: 's7',
    text: 'Às vezes o professor liga o modo Missão do cliente. Aí você recebe um cliente secreto, como a Dona Cida, que só quer fazer videochamada com os netos. Peça que o cliente não usa não conta, e cada acessório que ele pediu vale pontos. Leia a dica com atenção!',
    cues: { mode: 'Missão do cliente', secret: 'cliente secreto', cida: 'Dona Cida', call: 'videochamada', skip: 'não usa', extra: 'acessório que ele pediu', hint: 'Leia a dica' },
  },
  {
    id: 's8',
    text: 'Bora ver uma partida? Sai um processador, com lance inicial de quatrocentos e cinquenta reais. A Ana dá o lance, o Bruno cobre... e a Ana dá mais cinquenta e leva por quinhentos e dez! Depois sai uma cadeira gamer, e o Bruno gasta quinhentos nela. [laughs] Bruno, cadeira não liga computador!',
    cues: { go: 'Bora ver', cpu: 'Sai um processador', ana1: 'A Ana dá o lance', bruno: 'o Bruno cobre', ana2: 'mais cinquenta|mais 50', sold: 'leva por', chair: 'sai uma cadeira', spend: 'o Bruno gasta', joke: 'Bruno, cadeira' },
  },
  {
    id: 's9',
    text: 'Quando a partida acaba, a tevê mostra o computador de cada um, do menor para o maior, com as peças que faltaram. O Bruno chegou a quarenta por cento... e a Ana, a noventa! Depois vem o pódio!',
    cues: { end: 'partida acaba', each: 'computador de cada um', missing: 'peças que faltaram', bruno: 'O Bruno chegou', ana: 'e a Ana', podium: 'pódio' },
  },
  {
    id: 's10',
    text: 'Resumindo: escute o cliente, gaste com cuidado e compre primeiro o essencial. [excited] Preparados? Então... que comece o leilão!',
    cues: { listen: 'escute o cliente', spend: 'gaste com cuidado', first: 'essencial', ready: 'Preparados', go: 'que comece' },
  },
];
