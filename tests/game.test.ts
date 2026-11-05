import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game, GameError, type Clock } from '../server/game.ts';
import { BID_MS, INTRO_MS, SPIN_MS, TIE_MS, RESULT_MS, rankPlayers } from '../shared/protocol.ts';
import { ITEMS, scoreBuild } from '../shared/catalog.ts';

function fakeClock(seed = 1) {
  let now = 1_000_000;
  let s = seed;
  const timers: { at: number; fn: () => void; id: number }[] = [];
  let id = 0;
  const clock: Clock = {
    now: () => now,
    set: (fn, ms) => (timers.push({ at: now + ms, fn, id: ++id }), id),
    clear: (h) => {
      const k = timers.findIndex((t) => t.id === h);
      if (k >= 0) timers.splice(k, 1);
    },
    random: () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646,
  };
  const advance = (ms: number) => {
    const end = now + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at);
      const next = timers[0];
      if (!next || next.at > end) break;
      timers.shift();
      now = next.at;
      next.fn();
    }
    now = end;
  };
  return { clock, advance };
}

function setup(players = 2, balance = 3000, mode: 'classic' | 'mission' = 'classic') {
  const { clock, advance } = fakeClock();
  const game = new Game({ clock });
  const room = game.createRoom({ startingBalance: balance, matchMinutes: 30, mode });
  const ps = Array.from({ length: players }, (_, k) => game.join(room.code, `Aluno ${k + 1}`).player);
  return { game, room, ps, advance };
}

const toBidding = (advance: (ms: number) => void) => advance(SPIN_MS + INTRO_MS);

test('lance aberto: maior lance vence e paga', () => {
  const { game, room, ps, advance } = setup();
  game.start(room);
  room.lot!.secret = false;
  assert.equal(room.phase, 'spinning');
  assert.throws(() => game.bid(room, ps[0].id, 999), GameError); // roleta ainda girando
  toBidding(advance);
  assert.equal(room.phase, 'bidding');
  const start = room.lot!.startPrice;
  assert.throws(() => game.bid(room, ps[0].id, start - 1), /pelo menos/);
  game.bid(room, ps[0].id, start);
  assert.throws(() => game.bid(room, ps[0].id, start + 50), /maior lance/);
  assert.throws(() => game.bid(room, ps[1].id, start + 5), /pelo menos/); // passo mínimo R$ 10
  game.bid(room, ps[1].id, start + 10);
  assert.throws(() => game.bid(room, ps[0].id, 3001), /saldo/);
  advance(BID_MS);
  assert.equal(room.phase, 'result');
  assert.equal(room.lot!.result!.winnerId, ps[1].id);
  assert.equal(ps[1].balance, 3000 - start - 10);
  assert.deepEqual(ps[1].items, [room.lot!.itemId]);
  assert.equal(room.wheel.includes(room.lot!.itemId), false);
  advance(RESULT_MS);
  assert.equal(room.phase, 'spinning'); // gira sozinho o próximo item
});

test('lance secreto: empate refaz uma vez, depois vence quem mandou primeiro', () => {
  const { game, room, ps, advance } = setup(3);
  game.start(room);
  room.lot!.secret = true;
  toBidding(advance);
  const v = room.lot!.startPrice + 100;
  game.bid(room, ps[0].id, v);
  assert.equal(room.lot!.bids[0].amount, null, 'valor fica escondido');
  assert.throws(() => game.bid(room, ps[0].id, v + 10), /já deu/);
  game.bid(room, ps[1].id, v);
  advance(BID_MS);
  assert.equal(room.lot!.result!.kind, 'tie');
  advance(TIE_MS);
  assert.equal(room.phase, 'bidding');
  assert.equal(room.lot!.round, 2);
  game.bid(room, ps[1].id, v);
  advance(100);
  game.bid(room, ps[0].id, v);
  game.bid(room, ps[2].id, room.lot!.startPrice); // todos deram lance → fecha em 1,5 s
  advance(1500);
  assert.equal(room.lot!.result!.kind, 'sold');
  assert.equal(room.lot!.result!.winnerId, ps[1].id);
  assert.equal(room.lot!.result!.tiebreak, true);
  assert.equal(room.lot!.result!.revealed!.length, 3);
});

test('sem lances o item sai da roleta e ninguém paga', () => {
  const { game, room, ps, advance } = setup();
  game.start(room);
  const item = room.lot!.itemId;
  toBidding(advance);
  advance(BID_MS);
  assert.equal(room.lot!.result!.kind, 'none');
  assert.equal(room.wheel.includes(item), false);
  assert.equal(ps[0].balance, 3000);
});

test('partida acaba quando o tempo esgota ou ninguém tem saldo', () => {
  const t = setup();
  t.game.start(t.room);
  t.advance(30 * 60_000 + 2 * 60_000); // o item em andamento termina antes de encerrar
  assert.equal(t.room.phase, 'finished');
  assert.equal(t.room.endReason, 'time');

  const m = setup(1, 500);
  m.game.start(m.room);
  m.ps[0].balance = 10; // menor que qualquer lance inicial
  m.advance(SPIN_MS + INTRO_MS + BID_MS + RESULT_MS);
  assert.equal(m.room.endReason, 'money');
});

test('pausa segura o próximo giro até o professor continuar', () => {
  const { game, room, advance } = setup();
  game.start(room);
  toBidding(advance);
  game.setPaused(room, true);
  game.closeNow(room);
  advance(RESULT_MS * 3);
  assert.equal(room.phase, 'result');
  game.setPaused(room, false);
  assert.equal(room.phase, 'spinning');
});

test('nomes repetidos ganham número e cores variam', () => {
  const { game, room } = setup(0);
  const a = game.join(room.code, '  Ana  ').player;
  const b = game.join(room.code, 'ana').player;
  assert.equal(a.name, 'Ana');
  assert.equal(b.name, 'ana 2');
  assert.notEqual(a.color, b.color);
  assert.throws(() => game.join(room.code, 'x'), /2 letras/);
});

test('pontuação: PC sem monitor ≈ 90%, memória maior pontua mais', () => {
  const best = (slot: string) => ITEMS.filter((i) => i.slot === slot).sort((a, b) => b.quality - a.quality)[0].id;
  const slots = ['placa-mae', 'processador', 'memoria', 'armazenamento', 'fonte', 'cooler', 'gabinete', 'sistema', 'video', 'teclado', 'mouse'];
  const noMonitor = scoreBuild(slots.map(best));
  assert.equal(noMonitor.percent, 90);
  assert.deepEqual(noMonitor.missing.map((s) => s.id), ['monitor']);
  assert.equal(scoreBuild([...slots.map(best), 'mon-27g']).percent, 100);
  const base = ['mb-basica', 'cpu-i3', 'hd-500'];
  assert.ok(scoreBuild([...base, 'ram-16']).percent > scoreBuild([...base, 'ram-4']).percent);
  assert.equal(scoreBuild(['headset', 'cadeira']).percent, 0, 'acessório não liga o PC');
  assert.equal(scoreBuild(['ram-2', 'ram-32g']).percent, 10, 'repetido conta só o melhor');
  assert.ok(ITEMS.every((i) => i.price <= 700), 'lance inicial nunca passa de R$ 700');
});

test('ranking desempata pelo saldo que sobrou', () => {
  const mk = (id: string, items: string[], balance: number) => ({ id, name: id, color: '', balance, items, online: true });
  const r = rankPlayers([mk('a', ['ram-8'], 100), mk('b', ['ram-8'], 900), mk('c', [], 3000)]);
  assert.deepEqual(r.map((x) => x.player.id), ['b', 'a', 'c']);
});

test('missões: cada aluno recebe uma diferente e elas só aparecem no fim', () => {
  const { game, room, ps } = setup(23, 3000, 'mission');
  const ids = ps.map((p) => game.missionOf(room, p.id));
  assert.equal(new Set(ids).size, 23);
  assert.equal(game.view(room).missions, null, 'segredo durante o jogo');
  game.start(room);
  game.finish(room, 'teacher');
  assert.equal(Object.keys(game.view(room).missions!).length, 23);
});

test('nova partida na mesma sala zera saldo e peças e troca o modo', () => {
  const { game, room, ps, advance } = setup(2);
  game.start(room);
  room.lot!.secret = false;
  toBidding(advance);
  game.bid(room, ps[0].id, room.lot!.startPrice);
  game.closeNow(room);
  assert.throws(() => game.restart(room, { startingBalance: 4000, matchMinutes: 20, mode: 'mission' }), /Termine/);
  game.finish(room, 'teacher');
  game.restart(room, { startingBalance: 4000, matchMinutes: 20, mode: 'mission' });
  assert.equal(room.phase, 'lobby');
  assert.equal(room.mode, 'mission');
  assert.equal(room.players.length, 2);
  assert.deepEqual(ps.map((p) => [p.balance, p.items.length]), [[4000, 0], [4000, 0]]);
  assert.equal(room.wheel.length, 54);
  assert.ok(game.missionOf(room, ps[0].id));
});

test('respostas finais: só depois de liberar, completas, sem resposta curta e uma vez só', () => {
  const { game, room, ps } = setup(1);
  const sheet = { questions: ['a', 'b', 'c', 'd', 'e'], answers: Array(5).fill('Porque sem fonte o PC não liga.') };
  game.start(room);
  game.finish(room, 'teacher');
  assert.throws(() => game.submitAnswers(room, ps[0].id, sheet), /liberadas/);
  game.reveal(room);
  assert.throws(() => game.submitAnswers(room, ps[0].id, { ...sheet, answers: [...sheet.answers.slice(1), 'sim'] }), /pelo menos/);
  assert.throws(() => game.submitAnswers(room, ps[0].id, { ...sheet, answers: sheet.answers.slice(1) }), /5 perguntas/);
  game.submitAnswers(room, ps[0].id, sheet);
  assert.deepEqual(game.view(room).answered, [ps[0].id]);
  assert.throws(() => game.submitAnswers(room, ps[0].id, sheet), /já enviou/);
});

test('pontuação da missão: atender o cliente vale mais que peça cara', async () => {
  const { MISSION_BY_ID } = await import('../shared/missions.ts');
  const basic = ['mb-basica', 'cpu-i3', 'ram-4', 'hd-500', 'psu-400', 'cooler-box', 'case-simples', 'so-linux', 'kb-simples', 'mouse-simples'];
  const vovo = MISSION_BY_ID['vovo-chamada'];
  assert.equal(scoreBuild([...basic, 'mon-24', 'webcam', 'caixa-som'], vovo).percent, 100, 'vó não precisa de placa de vídeo');
  const monitorFraco = scoreBuild([...basic, 'mon-19', 'webcam', 'caixa-som'], vovo);
  assert.deepEqual(monitorFraco.weak.map((s) => s.id), ['monitor']);
  assert.ok(monitorFraco.percent < 100);
  assert.ok(scoreBuild([...basic, 'mon-24', 'gpu-gamer'], vovo).percent < scoreBuild([...basic, 'mon-24', 'webcam'], vovo).percent);
  const gamer = MISSION_BY_ID.gamer;
  assert.ok(scoreBuild([...basic, 'mon-19', 'gpu-gamer'], gamer).percent > scoreBuild([...basic, 'mon-19', 'gpu-basica'], gamer).percent);
  const { MISSIONS } = await import('../shared/missions.ts');
  assert.ok(MISSIONS.length >= 23);
  for (const m of MISSIONS) for (const id of m.extras ?? []) assert.equal(ITEMS.find((i) => i.id === id)?.slot, 'extra', `${m.id}: ${id}`);
});

test('perguntas finais usam o que cada aluno comprou e comparam com o vencedor', async () => {
  const { buildQuestions } = await import('../shared/questions.ts');
  const { game, room, ps } = setup(2);
  game.start(room);
  ps[0].items = ['cadeira'];
  ps[0].balance = 2200;
  ps[1].items = ['mb-basica', 'cpu-i3'];
  ps[1].balance = 2400;
  room.history = [
    { itemId: 'cadeira', winnerId: ps[0].id, price: 800, secret: false },
    { itemId: 'mb-basica', winnerId: ps[1].id, price: 250, secret: false },
    { itemId: 'cpu-i3', winnerId: ps[1].id, price: 350, secret: true },
  ];
  game.finish(room, 'teacher');
  const q = buildQuestions(game.view(room), ps[0].id);
  assert.equal(q.length, 5);
  assert.match(q[0], /R\$ 800 em acessórios \(Cadeira gamer\)/);
  assert.match(q[1], /sem Placa-mãe e sem Processador/);
  assert.match(q[2], /Cadeira gamer por R\$ 800.*R\$ 500/);
  assert.match(q[3], /Aluno 2 venceu com 23% gastando R\$ 600/);
  const winnerQ = buildQuestions(game.view(room), ps[1].id);
  assert.match(winnerQ[3], /Você venceu/);
  assert.match(winnerQ[2], /lance secreto/);
});
