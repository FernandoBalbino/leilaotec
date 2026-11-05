// Conexão com o servidor e estado da sala compartilhado entre as telas.
import { io, type Socket } from 'socket.io-client';
import { useSyncExternalStore } from 'react';
import type { Ack, Bid, ClientEvents, PublicRoom, ServerEvents } from '../../shared/protocol.ts';

export const SERVER_URL: string = import.meta.env.VITE_SERVER_URL || `${location.protocol}//${location.hostname}:3000`;

export const socket: Socket<ServerEvents, ClientEvents> = io(SERVER_URL, {
  transports: ['websocket', 'polling'],
  reconnectionDelayMax: 4000,
});

let room: PublicRoom | null = null;
const offsets: number[] = [];
const listeners = new Set<() => void>();
const bidListeners = new Set<(bid: Bid) => void>();
const emit = () => listeners.forEach((f) => f());

// O relógio do servidor manda: a amostra com menor atraso de rede é a de maior diferença.
function sample(serverNow: number) {
  offsets.push(serverNow - Date.now());
  if (offsets.length > 12) offsets.shift();
}
export const serverNow = () => Date.now() + (offsets.length ? Math.max(...offsets) : 0);

socket.on('state', (r) => {
  sample(r.serverNow);
  room = r;
  emit();
});
socket.on('bid', ({ bid, serverNow: now }) => {
  sample(now);
  if (!room?.lot) return;
  room = { ...room, lot: { ...room.lot, bids: [...room.lot.bids, bid] } };
  emit();
  bidListeners.forEach((f) => f(bid));
});

// Missão secreta: chega só para o próprio aluno (não vem no estado da sala).
let missionId: string | null = null;
socket.on('mission', (p) => {
  missionId = p.missionId;
  emit();
});

export const clearRoom = () => {
  room = null;
  missionId = null;
  emit();
};
export const onBid = (f: (bid: Bid) => void) => {
  bidListeners.add(f);
  return () => void bidListeners.delete(f);
};
const subscribe = (f: () => void) => {
  listeners.add(f);
  return () => void listeners.delete(f);
};
export const useRoom = () => useSyncExternalStore(subscribe, () => room);
export const useMissionId = () => useSyncExternalStore(subscribe, () => missionId);

let connected = socket.connected;
socket.on('connect', () => ((connected = true), emit()));
socket.on('disconnect', () => ((connected = false), emit()));
export const useConnected = () => useSyncExternalStore(subscribe, () => connected);

export async function send<E extends keyof ClientEvents>(
  event: E,
  payload: Parameters<ClientEvents[E]>[0],
): Promise<Parameters<Parameters<ClientEvents[E]>[1]>[0]> {
  try {
    // @ts-expect-error emitWithAck não consegue inferir o tipo do ack genérico
    return await socket.timeout(8000).emitWithAck(event, payload);
  } catch {
    return { ok: false, error: 'Sem resposta do servidor. Verifique a internet.' } as Ack as never;
  }
}

// Sessão salva para voltar depois de recarregar a página.
export type Session =
  | { role: 'teacher'; code: string; token: string }
  | { role: 'player'; code: string; token: string; playerId: string };
const KEY = 'leilaotec:sessao';
export function loadSession(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
}
export function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* modo anônimo sem storage: a sessão só vale até recarregar */
  }
}
