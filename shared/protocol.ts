// Tipos e tempos trocados entre servidor e navegador.
import { scoreBuild, type Score } from './catalog.ts';

export const SPIN_MS = 7000; // roleta girando
export const INTRO_MS = 2600; // item fica grande e encolhe até o painel
export const BID_MS = 60_000; // tempo para dar lances
export const RESULT_MS = 7000; // tela de "vendido"
export const SECRET_RESULT_MS = 9000; // revelação dos lances secretos
export const TIE_MS = 4000; // aviso de empate antes de refazer o lance secreto
export const MIN_STEP = 10; // aumento mínimo sobre o maior lance aberto
export const SECRET_SHARE = 0.25; // fração de itens com lance secreto

export type Phase = 'lobby' | 'spinning' | 'bidding' | 'result' | 'finished';
export type EndReason = 'time' | 'items' | 'money' | 'teacher';

export interface PublicPlayer {
  id: string;
  name: string;
  color: string;
  balance: number;
  items: string[];
  online: boolean;
}

export interface Bid {
  playerId: string;
  amount: number | null; // null = lance secreto enviado (valor escondido)
  at: number;
}

export interface LotResult {
  kind: 'sold' | 'none' | 'tie';
  winnerId: string | null;
  price: number;
  tiebreak?: boolean; // segundo empate seguido: venceu quem mandou primeiro
  revealed?: Bid[]; // lances secretos abertos no fim
}

export interface Lot {
  itemId: string;
  secret: boolean;
  startPrice: number;
  round: number;
  spinStartAt: number;
  biddingEndsAt: number;
  bids: Bid[];
  result?: LotResult;
}

export interface HistoryEntry {
  itemId: string;
  winnerId: string | null;
  price: number;
  secret: boolean;
}

export interface PublicRoom {
  code: string;
  phase: Phase;
  serverNow: number;
  startingBalance: number;
  matchMinutes: number;
  matchEndsAt: number | null;
  players: PublicPlayer[];
  wheel: string[]; // itens que ainda estão na roleta, na ordem das fatias
  secretItems: string[];
  lot: Lot | null;
  paused: boolean;
  revealed: boolean;
  endReason: EndReason | null;
  history: HistoryEntry[];
}

export type Ack<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export interface ClientEvents {
  'teacher:create': (p: { startingBalance: number; matchMinutes: number }, ack: (r: Ack<{ code: string; token: string }>) => void) => void;
  'teacher:resume': (p: { code: string; token: string }, ack: (r: Ack) => void) => void;
  'teacher:action': (p: { action: 'start' | 'pause' | 'resume' | 'close' | 'end' | 'reveal' | 'kick'; playerId?: string }, ack: (r: Ack) => void) => void;
  'player:join': (p: { code: string; name: string }, ack: (r: Ack<{ playerId: string; token: string }>) => void) => void;
  'player:resume': (p: { code: string; token: string }, ack: (r: Ack<{ playerId: string; secretBid: number | null }>) => void) => void;
  'player:bid': (p: { amount: number }, ack: (r: Ack) => void) => void;
}

export interface ServerEvents {
  state: (room: PublicRoom) => void;
  bid: (p: { bid: Bid; serverNow: number }) => void;
  kicked: () => void;
}

export interface Ranked {
  player: PublicPlayer;
  score: Score;
  position: number;
}

// Mais funcional vence; empate no percentual → quem economizou mais.
export function rankPlayers(players: PublicPlayer[]): Ranked[] {
  return players
    .map((player) => ({ player, score: scoreBuild(player.items), position: 0 }))
    .sort((a, b) => b.score.percent - a.score.percent || b.player.balance - a.player.balance || a.player.name.localeCompare(b.player.name))
    .map((r, idx) => ({ ...r, position: idx + 1 }));
}

// Menor lance aceito agora (aberto: maior lance + passo; secreto: lance inicial).
export function minBid(lot: Lot): number {
  if (lot.secret) return lot.startPrice;
  const top = Math.max(0, ...lot.bids.map((b) => b.amount ?? 0));
  return top ? top + MIN_STEP : lot.startPrice;
}
