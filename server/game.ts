// Regras do leilão. Sem rede: o servidor chama estes métodos e publica o estado.
import { randomBytes } from 'node:crypto';
import { ITEMS, ITEM_BY_ID, brl } from '../shared/catalog.ts';
import {
  BID_MS, INTRO_MS, RESULT_MS, SECRET_RESULT_MS, SECRET_SHARE, SPIN_MS, TIE_MS, minBid,
  type Bid, type EndReason, type HistoryEntry, type Lot, type Phase, type PublicPlayer, type PublicRoom,
} from '../shared/protocol.ts';

export const COLORS = [
  '#ff5d73', '#ffb020', '#2ee6a6', '#4cc9f0', '#7c5cff', '#ff7ab6', '#a3e635', '#f97316',
  '#22d3ee', '#e879f9', '#facc15', '#60a5fa', '#34d399', '#fb7185', '#c084fc', '#2dd4bf',
];
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const MAX_PLAYERS = 40;
const IDLE_MS = 4 * 60 * 60 * 1000;

export interface Clock {
  now(): number;
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
  random(): number;
}

export const realClock: Clock = {
  now: () => Date.now(),
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
  random: Math.random,
};

interface Player extends PublicPlayer {
  token: string;
  bidTimes: number[];
}

export interface Room {
  code: string;
  teacherToken: string;
  phase: Phase;
  startingBalance: number;
  matchMinutes: number;
  matchEndsAt: number | null;
  players: Player[];
  wheel: string[];
  secret: Set<string>;
  lot: Lot | null;
  sealed: Map<string, { amount: number; at: number }>;
  paused: boolean;
  revealed: boolean;
  endReason: EndReason | null;
  history: HistoryEntry[];
  timer: unknown;
  lastActivity: number;
}

export class GameError extends Error {}

function fail(msg: string): never {
  throw new GameError(msg);
}
const token = () => randomBytes(16).toString('hex');

export class Game {
  rooms = new Map<string, Room>();
  clock: Clock;
  onChange: (room: Room) => void;
  onBid: (room: Room, bid: Bid) => void;
  maxRooms: number;
  secretShare: number;

  constructor(opts: { clock?: Clock; onChange?: (room: Room) => void; onBid?: (room: Room, bid: Bid) => void; maxRooms?: number; secretShare?: number } = {}) {
    this.clock = opts.clock ?? realClock;
    this.onChange = opts.onChange ?? (() => {});
    this.onBid = opts.onBid ?? (() => {});
    this.maxRooms = opts.maxRooms ?? 30;
    this.secretShare = opts.secretShare ?? SECRET_SHARE;
  }

  private shuffle<T>(list: T[]): T[] {
    const a = [...list];
    for (let k = a.length - 1; k > 0; k--) {
      const j = Math.floor(this.clock.random() * (k + 1));
      [a[k], a[j]] = [a[j], a[k]];
    }
    return a;
  }

  private touch(room: Room) {
    room.lastActivity = this.clock.now();
    this.onChange(room);
  }

  private schedule(room: Room, fn: () => void, ms: number) {
    if (room.timer) this.clock.clear(room.timer);
    room.timer = this.clock.set(() => {
      room.timer = null;
      fn();
    }, ms);
  }

  cleanup() {
    const now = this.clock.now();
    for (const [code, room] of this.rooms)
      if (now - room.lastActivity > IDLE_MS) {
        if (room.timer) this.clock.clear(room.timer);
        this.rooms.delete(code);
      }
  }

  createRoom(startingBalance: number, matchMinutes: number) {
    if (!Number.isInteger(startingBalance) || startingBalance < 500 || startingBalance > 20000) fail('Saldo inicial inválido.');
    if (!Number.isInteger(matchMinutes) || matchMinutes < 5 || matchMinutes > 120) fail('Duração inválida.');
    this.cleanup();
    if (this.rooms.size >= this.maxRooms) fail('O servidor está cheio. Tente de novo em alguns minutos.');
    let code = '';
    do code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(this.clock.random() * CODE_CHARS.length)]).join('');
    while (this.rooms.has(code));
    const wheel = this.shuffle(ITEMS.map((it) => it.id));
    const room: Room = {
      code, teacherToken: token(), phase: 'lobby', startingBalance, matchMinutes, matchEndsAt: null,
      players: [], wheel, secret: new Set(this.shuffle(wheel).slice(0, Math.round(wheel.length * this.secretShare))),
      lot: null, sealed: new Map(), paused: false, revealed: false, endReason: null, history: [], timer: null,
      lastActivity: this.clock.now(),
    };
    this.rooms.set(code, room);
    return room;
  }

  room(code: unknown): Room {
    const room = typeof code === 'string' ? this.rooms.get(code.trim().toUpperCase()) : undefined;
    return room ?? fail('Sala não encontrada. Confira o código.');
  }

  teacher(code: unknown, tok: unknown): Room {
    const room = this.room(code);
    if (tok !== room.teacherToken) fail('Acesso de professor inválido.');
    return room;
  }

  join(code: unknown, rawName: unknown) {
    const room = this.room(code);
    if (room.phase === 'finished') fail('Essa partida já terminou.');
    if (room.players.length >= MAX_PLAYERS) fail('A sala está cheia.');
    let name = String(rawName ?? '').replace(/\s+/g, ' ').trim().slice(0, 18);
    if (name.length < 2) fail('Digite seu nome (pelo menos 2 letras).');
    const taken = (n: string) => room.players.some((p) => p.name.toLowerCase() === n.toLowerCase());
    for (let k = 2; taken(name); k++) name = `${name.replace(/ \d+$/, '')} ${k}`;
    const used = new Set(room.players.map((p) => p.color));
    const free = COLORS.filter((c) => !used.has(c));
    const pool = free.length ? free : COLORS;
    const player: Player = {
      id: token().slice(0, 10), token: token(), name, color: pool[Math.floor(this.clock.random() * pool.length)],
      balance: room.startingBalance, items: [], online: true, bidTimes: [],
    };
    room.players.push(player);
    this.touch(room);
    return { room, player };
  }

  resume(code: unknown, tok: unknown) {
    const room = this.room(code);
    const player = room.players.find((p) => p.token === tok) ?? fail('Você não está mais nessa sala.');
    return { room, player, secretBid: room.sealed.get(player.id)?.amount ?? null };
  }

  setOnline(room: Room, playerId: string, online: boolean) {
    const p = room.players.find((x) => x.id === playerId);
    if (p && p.online !== online) {
      p.online = online;
      this.touch(room);
    }
  }

  start(room: Room) {
    if (room.phase !== 'lobby') fail('A partida já começou.');
    if (!room.players.length) fail('Espere pelo menos 1 aluno entrar.');
    room.matchEndsAt = this.clock.now() + room.matchMinutes * 60_000;
    this.spin(room);
  }

  private endReason(room: Room): EndReason | null {
    if (!room.wheel.length) return 'items';
    if (room.matchEndsAt && this.clock.now() >= room.matchEndsAt) return 'time';
    const cheapest = Math.min(...room.wheel.map((id) => ITEM_BY_ID[id].price));
    if (room.players.length && room.players.every((p) => p.balance < cheapest)) return 'money';
    return null;
  }

  private spin(room: Room) {
    const reason = this.endReason(room);
    if (reason) return this.finish(room, reason);
    const itemId = room.wheel[Math.floor(this.clock.random() * room.wheel.length)];
    const now = this.clock.now();
    room.sealed.clear();
    room.lot = {
      itemId, secret: room.secret.has(itemId), startPrice: ITEM_BY_ID[itemId].price, round: 1,
      spinStartAt: now, biddingEndsAt: now + SPIN_MS + INTRO_MS + BID_MS, bids: [],
    };
    room.phase = 'spinning';
    this.schedule(room, () => this.openBidding(room), SPIN_MS + INTRO_MS);
    this.touch(room);
  }

  private openBidding(room: Room) {
    if (!room.lot) return;
    room.phase = 'bidding';
    room.lot.biddingEndsAt = this.clock.now() + BID_MS;
    this.schedule(room, () => this.close(room), BID_MS);
    this.touch(room);
  }

  bid(room: Room, playerId: string, amount: unknown) {
    const lot = room.lot;
    const player = room.players.find((p) => p.id === playerId) ?? fail('Jogador não encontrado.');
    const now = this.clock.now();
    if (room.phase !== 'bidding' || !lot || now >= lot.biddingEndsAt) fail('Os lances não estão abertos agora.');
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) fail('Digite um valor inteiro em reais.');
    player.bidTimes = player.bidTimes.filter((t) => now - t < 2000);
    if (player.bidTimes.length >= 6) fail('Calma! Espere um pouquinho entre os lances.');
    if (amount > player.balance) fail(`Você só tem ${brl(player.balance)} de saldo.`);
    const min = minBid(lot);
    if (amount < min) fail(`O lance precisa ser de pelo menos ${brl(min)}.`);
    let bid: Bid;
    if (lot.secret) {
      if (room.sealed.has(player.id)) fail('Você já deu seu lance secreto neste item.');
      room.sealed.set(player.id, { amount, at: now });
      bid = { playerId, amount: null, at: now };
    } else {
      if (lot.bids.at(-1)?.playerId === playerId) fail('Você já tem o maior lance!');
      bid = { playerId, amount, at: now };
    }
    player.bidTimes.push(now);
    lot.bids.push(bid);
    room.lastActivity = now;
    this.onBid(room, bid);
    if (lot.secret) {
      const eligible = room.players.filter((p) => p.online && p.balance >= lot.startPrice);
      if (eligible.every((p) => room.sealed.has(p.id))) {
        lot.biddingEndsAt = Math.min(lot.biddingEndsAt, now + 1500);
        this.schedule(room, () => this.close(room), 1500);
        this.touch(room);
      }
    }
  }

  close(room: Room) {
    const lot = room.lot;
    if (room.phase !== 'bidding' || !lot) return;
    let winnerId: string | null = null;
    let price = 0;
    let tiebreak = false;
    let revealed: Bid[] | undefined;
    if (lot.secret) {
      const entries = [...room.sealed].map(([playerId, b]) => ({ playerId, amount: b.amount, at: b.at }));
      revealed = [...entries].sort((a, b) => a.amount - b.amount || b.at - a.at);
      if (entries.length) {
        price = Math.max(...entries.map((e) => e.amount));
        const tops = entries.filter((e) => e.amount === price).sort((a, b) => a.at - b.at);
        if (tops.length > 1 && lot.round === 1) {
          lot.result = { kind: 'tie', winnerId: null, price, revealed };
          room.phase = 'result';
          this.schedule(room, () => this.restartSecret(room), TIE_MS);
          return this.touch(room);
        }
        tiebreak = tops.length > 1;
        winnerId = tops[0].playerId;
      }
    } else {
      const top = lot.bids.at(-1);
      if (top) [winnerId, price] = [top.playerId, top.amount ?? 0];
    }
    const winner = room.players.find((p) => p.id === winnerId);
    if (winner) {
      winner.balance -= price;
      winner.items.push(lot.itemId);
    } else winnerId = null;
    lot.result = { kind: winnerId ? 'sold' : 'none', winnerId, price: winnerId ? price : 0, tiebreak, revealed };
    room.wheel = room.wheel.filter((id) => id !== lot.itemId);
    room.history.push({ itemId: lot.itemId, winnerId, price: lot.result.price, secret: lot.secret });
    room.phase = 'result';
    this.schedule(room, () => this.afterResult(room), lot.secret && winnerId ? SECRET_RESULT_MS : RESULT_MS);
    this.touch(room);
  }

  private restartSecret(room: Room) {
    const lot = room.lot;
    if (!lot || room.phase !== 'result') return;
    lot.round += 1;
    lot.bids = [];
    lot.result = undefined;
    room.sealed.clear();
    room.phase = 'bidding';
    lot.biddingEndsAt = this.clock.now() + BID_MS;
    this.schedule(room, () => this.close(room), BID_MS);
    this.touch(room);
  }

  private afterResult(room: Room) {
    if (room.phase === 'result' && !room.paused) this.spin(room);
  }

  setPaused(room: Room, paused: boolean) {
    if (room.phase === 'lobby' || room.phase === 'finished') fail('Não há partida em andamento.');
    room.paused = paused;
    // Continuar depois da tela de resultado já encerrada: gira na hora.
    if (!paused && room.phase === 'result' && !room.timer) this.spin(room);
    this.touch(room);
  }

  closeNow(room: Room) {
    if (room.phase !== 'bidding') fail('Não há lances abertos agora.');
    this.close(room);
  }

  finish(room: Room, reason: EndReason) {
    if (room.timer) this.clock.clear(room.timer);
    room.timer = null;
    room.phase = 'finished';
    room.lot = null;
    room.endReason = reason;
    this.touch(room);
  }

  reveal(room: Room) {
    if (room.phase !== 'finished') fail('A partida ainda não terminou.');
    room.revealed = true;
    this.touch(room);
  }

  kick(room: Room, playerId: unknown) {
    const player = room.players.find((p) => p.id === playerId) ?? fail('Aluno não encontrado.');
    room.players = room.players.filter((p) => p !== player);
    room.sealed.delete(player.id);
    if (room.lot && !room.lot.result) room.lot.bids = room.lot.bids.filter((b) => b.playerId !== player.id);
    this.touch(room);
    return player;
  }

  view(room: Room): PublicRoom {
    return {
      code: room.code, phase: room.phase, serverNow: this.clock.now(), startingBalance: room.startingBalance,
      matchMinutes: room.matchMinutes, matchEndsAt: room.matchEndsAt,
      players: room.players.map(({ id, name, color, balance, items, online }) => ({ id, name, color, balance, items, online })),
      wheel: room.wheel, secretItems: room.wheel.filter((id) => room.secret.has(id)), lot: room.lot,
      paused: room.paused, revealed: room.revealed, endReason: room.endReason, history: room.history,
    };
  }
}
