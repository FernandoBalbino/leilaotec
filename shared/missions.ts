// Missões secretas do modo "Monte para o cliente". A dica orienta sem entregar a lista de peças.
import type { Needs } from './catalog.ts';

export interface Mission extends Needs {
  id: string;
  emoji: string;
  client: string;
  title: string;
  story: string;
  hint: string;
  lesson: string; // aparece só na apresentação final
}

export const MISSIONS: Mission[] = [
  {
    id: 'gamer', emoji: '🎮', client: 'Kevin, 15 anos', title: 'O gamer sem limites',
    story: 'O Kevin juntou a mesada do ano inteiro (e vendeu a bicicleta) para jogar os lançamentos no gráfico máximo. Ele não larga o time no Discord nem para jantar.',
    hint: 'Para jogar pesado, invista em peças gamer ou mais potentes. E lembre que ele conversa com o time enquanto joga.',
    focus: { video: 'top', processador: 'mid', memoria: 'mid', fonte: 'mid' }, extras: ['headset'],
    lesson: 'Jogo pesado pede placa de vídeo forte, processador e memória bons e uma fonte que aguente tudo.',
  },
  {
    id: 'vovo-chamada', emoji: '👵', client: 'Dona Cida, 72 anos', title: 'Videochamada com os netos',
    story: 'Todo dia, às 20h em ponto, a Dona Cida quer ver e ouvir os netos que moram em Portugal. Ela já avisou: "nada de joguinho nesse computador!".',
    hint: 'Pense em como os netos vão ver a vó e em como ela vai ouvir a família. Peça gamer aqui é dinheiro jogado fora.',
    skip: ['video'], focus: { monitor: 'mid' }, extras: ['webcam', 'caixa-som'],
    lesson: 'Videochamada precisa de câmera e som. Para esse uso, a placa de vídeo nem faz falta.',
  },
  {
    id: 'enem', emoji: '📚', client: 'Larissa, 17 anos', title: 'Rumo ao ENEM',
    story: 'A Larissa estuda 10 horas por dia com 37 abas abertas, videoaula tocando no fundo e resumos impressos colados na parede do quarto.',
    hint: 'Muitas abas e programas abertos ao mesmo tempo pedem mais de uma certa peça. E os resumos de papel precisam sair de algum lugar.',
    skip: ['video'], focus: { memoria: 'mid' }, extras: ['impressora'],
    lesson: 'Muitas abas abertas pedem memória RAM, e a impressora é uma ferramenta de estudo para ela.',
  },
  {
    id: 'cinefilo', emoji: '🍿', client: 'Seu Jorge, 54 anos', title: 'Cinema em casa',
    story: 'O Seu Jorge quer maratonar filmes no fim de semana com a família toda no sofá. Para ele, se o som não fizer a pipoca tremer, não vale.',
    hint: 'Para ele importam a tela e o som. O resto pode ser simples.',
    skip: ['video'], focus: { monitor: 'mid' }, extras: ['caixa-som'],
    lesson: 'Para ver filmes, tela boa e som caprichado valem mais que peças gamer.',
  },
  {
    id: 'podcast', emoji: '🎙️', client: 'Thiago, 22 anos', title: 'Podcast "Café com Bug"',
    story: 'O Thiago vai lançar um podcast e quer gravar e editar um episódio por semana sem gravar junto o vizinho furando a parede.',
    hint: 'Áudio limpo é tudo: pense no que capta a voz e no que deixa ouvir cada detalhe. Para editar sem travar, o processador ajuda.',
    skip: ['video'], focus: { processador: 'mid' }, extras: ['microfone', 'headset'],
    lesson: 'Gravar áudio pede microfone e fone; um processador melhor acelera a edição.',
  },
  {
    id: 'streamer', emoji: '📹', client: 'Bia, 19 anos', title: 'Streamer de Minecraft',
    story: 'A Bia joga e faz live ao mesmo tempo para 300 seguidores fiéis. O quarto dela tem mais cor que um arco-íris.',
    hint: 'Jogar e transmitir juntos exige uma máquina forte. E o público precisa te ver, te ouvir e se impressionar com o cenário.',
    focus: { processador: 'mid', memoria: 'mid', video: 'mid' }, extras: ['webcam', 'microfone', 'fita-led'],
    lesson: 'Live e jogo ao mesmo tempo puxam processador e memória. Câmera, microfone e cenário fazem o show.',
  },
  {
    id: 'contador', emoji: '🧾', client: 'Seu Armando', title: 'O contador da padaria',
    story: 'O Seu Armando faz as contas da padaria, emite notas e imprime tudo. Na última queda de luz ele perdeu a planilha do mês e quase chorou em cima do pão francês.',
    hint: 'Pense em papel e no que protege o trabalho quando a energia cai de repente.',
    skip: ['video'], extras: ['impressora', 'nobreak'],
    lesson: 'O nobreak mantém o PC ligado quando a energia cai, e a impressora é ferramenta de trabalho.',
  },
  {
    id: 'editora', emoji: '🎬', client: 'Mel, 20 anos', title: 'Editora de vídeos do YouTube',
    story: 'A Mel edita vídeos para clientes com prazo para ontem. Se o PC travar na hora de exportar, ela perde o cliente (e a paciência).',
    hint: 'Editar vídeo é uma das tarefas mais pesadas que existem: precisa processar rápido, ter muita memória e abrir arquivos grandes sem demora.',
    focus: { processador: 'top', memoria: 'top', video: 'mid', armazenamento: 'mid' },
    lesson: 'Edição de vídeo usa tudo: processador, memória, placa de vídeo e um SSD rápido.',
  },
  {
    id: 'familia', emoji: '🏠', client: 'Família Souza', title: 'O PC da casa toda',
    story: 'O pai trabalha, o filho estuda, a mãe vê receitas e a avó joga paciência. O problema: o Wi-Fi não chega no quarto onde o computador vai ficar.',
    hint: 'Precisa ser completo e funcionar bem para todo mundo. E a internet precisa chegar até o quarto.',
    skip: ['video'], focus: { memoria: 'mid' }, extras: ['roteador'],
    lesson: 'Um PC completo e equilibrado atende a família, e o roteador leva o Wi-Fi até o quarto.',
  },
  {
    id: 'advogada', emoji: '⚖️', client: 'Dra. Paula', title: 'Advogada em home office',
    story: 'A Dra. Paula faz audiências online o dia todo e digita petições gigantes. O juiz já reclamou que ela "parece um borrão" na tela.',
    hint: 'Ela precisa aparecer e ser ouvida com clareza, e passa o dia inteiro digitando.',
    skip: ['video'], focus: { teclado: 'mid' }, extras: ['webcam', 'headset'],
    lesson: 'Home office pede câmera, fone com microfone e conforto para digitar.',
  },
  {
    id: 'vovo-retro', emoji: '🕹️', client: 'Vovô Zé, 68 anos', title: 'Fliperama na sala',
    story: 'O Vovô Zé quer reviver os jogos de fliperama dos anos 80. Ele jura que jogar no teclado "não tem graça" e quer ouvir o plim-plim bem alto.',
    hint: 'Jogo antigo é leve e roda em qualquer PC. Pense no que ele quer segurar na mão e ouvir.',
    skip: ['video'], extras: ['controle', 'caixa-som'],
    lesson: 'Jogos antigos rodam em PC simples; o controle e o som é que fazem a diversão.',
  },
  {
    id: 'cientista', emoji: '🧪', client: 'Prof. Newton', title: 'O cientista maluco',
    story: 'O Prof. Newton roda simulações que levam 3 dias sem parar. Da última vez o PC esquentou tanto que derreteu o chocolate em cima da mesa.',
    hint: 'Cálculo pesado o tempo todo pede processamento forte, boa memória e muita refrigeração. E nada pode desligar no meio.',
    skip: ['video'], focus: { processador: 'top', memoria: 'mid', cooler: 'mid' }, extras: ['nobreak'],
    lesson: 'Processador no máximo por dias precisa de um cooler forte; o nobreak evita perder 3 dias de cálculo.',
  },
  {
    id: 'lojinha', emoji: '🏪', client: 'Dona Rosa', title: 'A lojinha do bairro',
    story: 'A Dona Rosa vende de pão de queijo a capinha de celular. Ela imprime etiquetas de preço e quer Wi-Fi para os clientes esperarem felizes.',
    hint: 'O computador pode ser simples. Pense nas etiquetas e na internet da loja.',
    skip: ['video'], extras: ['impressora', 'roteador'],
    lesson: 'Em um pequeno negócio, o básico bem montado e as ferramentas certas valem mais que potência.',
  },
  {
    id: 'dj', emoji: '🎧', client: 'DJ Ritmado', title: 'Produtor de funk',
    story: 'O DJ Ritmado produz batidas no quarto até de madrugada. Os vizinhos pediram para ele abaixar o volume, mas ele precisa sentir o grave.',
    hint: 'Ele precisa ouvir cada detalhe da batida, alto e no fone. E vários programas de música abertos juntos pesam.',
    skip: ['video'], focus: { memoria: 'mid', processador: 'mid' }, extras: ['caixa-som', 'headset'],
    lesson: 'Produção musical pede bom som e memória para vários programas abertos ao mesmo tempo.',
  },
  {
    id: 'programador', emoji: '💻', client: 'Lucas, 16 anos', title: 'Aprendiz de programador',
    story: 'O Lucas quer aprender a programar e criar o próximo app famoso. Ele abre o editor, o navegador, 12 tutoriais e o Discord, tudo junto.',
    hint: 'Muitas janelas abertas e um computador que liga e abre tudo rápido fazem diferença para quem programa.',
    skip: ['video'], focus: { memoria: 'mid', armazenamento: 'mid' },
    lesson: 'Memória e SSD deixam o computador ágil para programar.',
  },
  {
    id: 'fotografa', emoji: '📸', client: 'Ana Clara', title: 'Fotógrafa de casamentos',
    story: 'A Ana Clara tira 3 mil fotos por casamento e não pode perder nenhuma. Já imaginou perder o beijo dos noivos? Ela também edita as cores com todo o cuidado.',
    hint: 'Guardar muitas fotos com segurança, editar sem travar e ver as cores direito. E sempre ter uma cópia extra.',
    skip: ['video'], focus: { memoria: 'mid', monitor: 'mid', armazenamento: 'mid' }, extras: ['pendrive'],
    lesson: 'Fotos pedem armazenamento, memória e um bom monitor. Ter cópia de segurança é obrigação.',
  },
  {
    id: 'escola', emoji: '🏫', client: 'E.E. Futuro Brilhante', title: 'Sala de informática',
    story: 'O computador vai ser usado por 200 alunos por semana (coitado dele). A diretora quer que funcione e avisa que a verba é curta.',
    hint: 'Completo, simples e econômico. Ninguém aqui precisa de luzinha RGB.',
    skip: ['video'],
    lesson: 'Para a escola, o melhor PC é o completo e econômico: quem gasta menos atende mais alunos.',
  },
  {
    id: 'karaoke', emoji: '🎤', client: 'Tia Neide', title: 'Rainha do karaokê',
    story: 'Toda sexta tem karaokê na casa da Tia Neide. Ela canta Roberto Carlos, a família inteira canta junto e a letra precisa aparecer bem grande.',
    hint: 'Todo mundo precisa ouvir, cantar e enxergar a letra de longe.',
    skip: ['video'], focus: { monitor: 'mid' }, extras: ['microfone', 'caixa-som'],
    lesson: 'Karaokê é som e tela: microfone, caixa de som e um monitor maior.',
  },
  {
    id: 'proplayer', emoji: '🏆', client: 'Rafa, 18 anos', title: 'Pro player de Fortnite',
    story: 'O Rafa treina 8 horas por dia para o campeonato e jura que perdeu a última partida "por culpa do mouse". As costas dele também já estão reclamando.',
    hint: 'Tudo do melhor para jogar, inclusive o que fica na mão dele e em cima da mesa. E pense no conforto de quem joga 8 horas por dia.',
    focus: { video: 'top', monitor: 'top', mouse: 'top', teclado: 'top' }, extras: ['mousepad', 'headset', 'cadeira'],
    lesson: 'Pro player precisa de periféricos gamer e conforto, não só das peças de dentro do gabinete.',
  },
  {
    id: 'primeiro-pc', emoji: '🧓', client: 'Seu Valdir, 70 anos', title: 'O primeiro computador',
    story: 'O Seu Valdir nunca usou um computador. Ele quer ler as notícias do time e jogar paciência, e morre de medo de "quebrar a internet".',
    hint: 'Simples e completo. Nada de gasto à toa.',
    skip: ['video'],
    lesson: 'Às vezes o cliente só precisa do básico bem feito, e gastar pouco é um favor para ele.',
  },
  {
    id: 'animes', emoji: '🍥', client: 'Júlia, 16 anos', title: 'Maratonista de animes',
    story: 'A Júlia assiste 3 temporadas por fim de semana, de madrugada. Se acordar a mãe, fica um mês sem computador.',
    hint: 'Uma tela boa e um som que não acorde ninguém.',
    skip: ['video'], focus: { monitor: 'mid' }, extras: ['headset'],
    lesson: 'Para assistir de madrugada, uma tela boa e um fone de ouvido resolvem.',
  },
  {
    id: 'hamburgueria', emoji: '🍔', client: 'TechBurger', title: 'Recepção da hamburgueria',
    story: 'A TechBurger recebe pedidos, faz videochamada com fornecedores e imprime a comanda para a cozinha. O Wi-Fi dos clientes vive caindo.',
    hint: 'Pense nas comandas, nas reuniões com fornecedores e na internet da loja.',
    skip: ['video'], extras: ['impressora', 'webcam', 'roteador'],
    lesson: 'Comércio precisa de ferramentas de trabalho: impressora, câmera e rede funcionando.',
  },
  {
    id: 'ead', emoji: '🎓', client: 'Gabriel, 24 anos', title: 'Faculdade a distância',
    story: 'O Gabriel faz faculdade EAD à noite, com aulas ao vivo e provas online. Se a internet cair no meio da prova, ele zera.',
    hint: 'Ele precisa aparecer nas aulas, falar com o professor e ter uma internet que não caia.',
    skip: ['video'], extras: ['webcam', 'roteador'],
    lesson: 'Estudar online pede câmera e uma rede estável.',
  },
  {
    id: 'maker', emoji: '🤖', client: 'Mariana, 15 anos', title: 'Maker da feira de ciências',
    story: 'A Mariana programa robôs para a feira de ciências e grava vídeos dos projetos. Ela leva tudo para a escola no bolso.',
    hint: 'Programar e gravar os projetos pede um PC equilibrado. E os arquivos precisam viajar até a escola.',
    skip: ['video'], focus: { memoria: 'mid' }, extras: ['webcam', 'pendrive'],
    lesson: 'Projetos maker pedem um PC equilibrado, uma câmera para registrar e um jeito de levar os arquivos.',
  },
];

export const MISSION_BY_ID = Object.fromEntries(MISSIONS.map((m) => [m.id, m])) as Record<string, Mission>;
