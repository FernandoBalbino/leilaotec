// As 5 perguntas de reflexão do fim da partida, montadas com o que cada aluno fez no jogo.
import { ITEM_BY_ID, brl } from './catalog.ts';
import { MISSION_BY_ID } from './missions.ts';
import { rankPlayers, type PublicPlayer, type PublicRoom } from './protocol.ts';

const join = (names: string[]) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`);
const pct = (v: number) => `${Math.round(v)}%`;

export function buildQuestions(room: PublicRoom, playerId: string): string[] {
  const ranking = rankPlayers(room.players, room.missions);
  const me = ranking.find((r) => r.player.id === playerId);
  if (!me) return [];
  const winner = ranking[0];
  const spent = (p: PublicPlayer) => room.startingBalance - p.balance;
  const bought = room.history.filter((h) => h.winnerId === playerId);
  const mission = room.missions ? MISSION_BY_ID[room.missions[playerId]] : undefined;
  const who = mission?.client.split(',')[0];

  // 1. Prioridade: o que foi gasto com acessórios
  const extras = bought.filter((h) => ITEM_BY_ID[h.itemId].slot === 'extra');
  const extrasNames = join([...new Set(extras.map((h) => ITEM_BY_ID[h.itemId].name))]);
  const extrasSpent = extras.reduce((sum, h) => sum + h.price, 0);
  const q1 = !bought.length
    ? 'Você não arrematou nenhuma peça nesta partida. O que te impediu de comprar e o que você faria diferente na próxima?'
    : extras.length
      ? mission
        ? `Você gastou ${brl(extrasSpent)} em acessórios (${extrasNames}). Eles ajudavam ${who} na missão "${mission.title}"? Explique.`
        : `Você gastou ${brl(extrasSpent)} em acessórios (${extrasNames}). Eles ajudaram o seu computador a ligar e funcionar? Por que você comprou?`
      : mission
        ? `Você não comprou nenhum acessório. Algum acessório teria ajudado ${who} na missão "${mission.title}"? Qual e por quê?`
        : 'Você não gastou nada com acessórios. Isso foi de propósito? Por que é importante priorizar as peças principais?';

  // 2. Conhecimento: as peças mais importantes que faltaram (ou ficaram fracas na missão)
  const missing = [...me.score.missing].sort((a, b) => b.weight - a.weight).slice(0, 2);
  const weak = me.score.weak[0];
  const q2 =
    missing.length === 2
      ? `Seu computador ficou sem ${missing[0].name} e sem ${missing[1].name}. O que acontece com um PC sem ${missing[0].name}? E sem ${missing[1].name}?`
      : missing.length === 1
        ? `Seu computador ficou sem ${missing[0].name}. Para que serve essa peça e o que acontece sem ela?`
        : weak && mission
          ? `Você comprou ${weak.name}, mas ela era fraca para ${who}. Por que esse cliente precisava de uma peça melhor?`
          : 'Seu computador ficou completo! Qual peça foi a mais difícil de conseguir e por que ela é importante?';

  // 3. A compra mais cara: valeu o preço?
  const top = [...bought].sort((a, b) => b.price - a.price)[0];
  const topItem = top && ITEM_BY_ID[top.itemId];
  const q3 = !top
    ? 'Qual peça você mais queria e não conseguiu? Por que ela era importante?'
    : top.price > topItem.price
      ? `Sua compra mais cara foi ${topItem.name}${top.secret ? ' (no lance secreto)' : ''} por ${brl(top.price)}, sendo que o lance inicial era ${brl(topItem.price)}. Valeu a pena pagar ${pct((top.price / topItem.price - 1) * 100)} a mais? Por quê?`
      : `Você levou ${topItem.name} pelo lance inicial de ${brl(top.price)}. Foi sorte ou estratégia? Explique.`;

  // 4. Comparação com o vencedor
  const q4 =
    me.position === 1
      ? `Você venceu com ${pct(me.score.percent)} gastando ${brl(spent(me.player))}. Qual foi a sua estratégia? Que dica você daria para quem ficou atrás?`
      : `${winner.player.name} venceu com ${pct(winner.score.percent)} gastando ${brl(spent(winner.player))}. Você chegou a ${pct(me.score.percent)} gastando ${brl(spent(me.player))}. O que ${winner.player.name} fez de diferente de você?`;

  // 5. O cliente
  const q5 = mission
    ? `Sua missão era "${mission.title}" para ${mission.client}. Você atendeu bem esse cliente? O que compraria diferente se ele fosse um cliente de verdade?`
    : `Se um cliente te desse ${brl(room.startingBalance)} para montar um computador, quais 3 peças você compraria primeiro? Por quê?`;

  return [q1, q2, q3, q4, q5];
}
