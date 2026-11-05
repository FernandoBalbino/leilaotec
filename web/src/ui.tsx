import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ITEM_BY_ID, brl } from '../../shared/catalog.ts';
import type { Lot, PublicPlayer } from '../../shared/protocol.ts';
import { serverNow } from './net.ts';
import { play, setMuted, useMuted } from './sound.ts';

const BASE = import.meta.env.BASE_URL;
export const itemSrc = (id: string, thumb = false) => `${BASE}items/${thumb ? 'thumb/' : ''}${id}.webp`;
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Logo({ small }: { small?: boolean }) {
  return (
    <div className={`logo ${small ? 'logo-sm' : ''}`} aria-label="LeilãoTEC">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#lg)" />
        <path d="M10 21l7-7m-4-3l6 6m-1-9l5 5-3 3-5-5zM8 24h9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span>
        Leilão<b>TEC</b>
      </span>
    </div>
  );
}

// Mesma silhueta para todos; só a cor muda (sorteada pelo servidor).
export function Avatar({ color, size = 48, crown }: { color: string; size?: number; crown?: boolean }) {
  return (
    <span className="avatar" style={{ width: size, height: size, '--c': color } as CSSProperties}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill={color} />
        <circle cx="32" cy="32" r="32" fill="url(#avatar-shade)" />
        <circle cx="32" cy="25" r="11" fill="#fff" fillOpacity=".92" />
        <path d="M12 56c2-11 10-17 20-17s18 6 20 17a32 32 0 0 1-40 0z" fill="#fff" fillOpacity=".92" />
      </svg>
      {crown && <span className="crown" aria-label="maior lance">👑</span>}
    </span>
  );
}

export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <radialGradient id="avatar-shade" cx="30%" cy="25%" r="80%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".35" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ItemImg({ id, size, thumb, className = '' }: { id: string; size?: number; thumb?: boolean; className?: string }) {
  const item = ITEM_BY_ID[id];
  return (
    <img
      className={`item-img ${className}`}
      src={itemSrc(id, thumb)}
      alt={item?.name ?? ''}
      width={size}
      height={size}
      draggable={false}
      loading={thumb ? 'lazy' : 'eager'}
    />
  );
}

// Número que "rola" até o valor novo.
export function Money({ value, className = '' }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reducedMotion()) return setShown(value);
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 500);
      const v = a + (value - a) * (1 - (1 - k) ** 3);
      setShown(v);
      from.current = v;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={`money ${className}`}>{brl(shown)}</span>;
}

export function useTicker(ms: number) {
  const [, set] = useState(0);
  useEffect(() => {
    const id = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return serverNow();
}

export function Countdown({ endsAt, total, size = 120, sound = true }: { endsAt: number; total: number; size?: number; sound?: boolean }) {
  const now = useTicker(100);
  const left = Math.max(0, endsAt - now);
  const secs = Math.ceil(left / 1000);
  const last = useRef(secs);
  useEffect(() => {
    if (sound && secs !== last.current && secs <= 5 && secs >= 1) play('contagem', 0.9);
    last.current = secs;
  }, [secs, sound]);
  const r = 44;
  const c = 2 * Math.PI * r;
  const danger = secs <= 5;
  return (
    <div className={`countdown ${danger ? 'danger' : ''}`} style={{ width: size, height: size }} role="timer" aria-label={`${secs} segundos`}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} className="track" />
        <circle cx="50" cy="50" r={r} className="bar" strokeDasharray={c} strokeDashoffset={c * (1 - left / total)} />
      </svg>
      <span key={danger ? secs : 0}>{secs}</span>
    </div>
  );
}

export function MatchClock({ endsAt }: { endsAt: number | null }) {
  const now = useTicker(1000);
  if (!endsAt) return null;
  const left = Math.max(0, endsAt - now);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return (
    <span className={`pill ${left < 120000 ? 'pill-warn' : ''}`} title="Tempo restante da partida">
      ⏱ {m}:{String(s).padStart(2, '0')}
    </span>
  );
}

export function SoundToggle() {
  const muted = useMuted();
  return (
    <button className="icon-btn" onClick={() => setMuted(!muted)} aria-pressed={!muted} title={muted ? 'Ligar som' : 'Desligar som'}>
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

export function lastBidBy(lot: Lot | null, playerId: string) {
  if (!lot) return undefined;
  for (let k = lot.bids.length - 1; k >= 0; k--) if (lot.bids[k].playerId === playerId) return lot.bids[k];
  return undefined;
}

export function PlayerCard({ player, lot, me, compact }: { player: PublicPlayer; lot: Lot | null; me?: boolean; compact?: boolean }) {
  const bid = lastBidBy(lot, player.id);
  const live = lot && !lot.result;
  const leader = !!live && !lot.secret && !!bid && lot.bids.at(-1)?.playerId === player.id;
  const winner = lot?.result?.winnerId === player.id;
  const bidsCount = lot?.bids.filter((b) => b.playerId === player.id).length ?? 0;
  return (
    <article
      className={`pcard ${leader ? 'leader' : ''} ${winner ? 'winner' : ''} ${me ? 'me' : ''} ${compact ? 'compact' : ''} ${player.online ? '' : 'offline'}`}
      style={{ '--c': player.color } as CSSProperties}
    >
      <div className="pcard-top">
        <Avatar color={player.color} size={compact ? 34 : 44} crown={leader} />
        <div className="pcard-name">
          <strong title={player.name}>{player.name}{me && <em> (você)</em>}</strong>
          <small><Money value={player.balance} /></small>
        </div>
        <div className="pcard-bid" key={bidsCount}>
          {live && lot.secret ? (
            bid ? <span className="sealed">🔒 enviado</span> : <span className="waiting">pensando…</span>
          ) : live && bid?.amount ? (
            <Money value={bid.amount} className="bid-big" />
          ) : live ? (
            <span className="waiting">—</span>
          ) : null}
        </div>
      </div>
      <div className="pcard-items" aria-label={`Peças de ${player.name}`}>
        {player.items.length ? (
          player.items.map((id, k) => (
            <span className="mini" key={id + k} title={ITEM_BY_ID[id]?.name}>
              <ItemImg id={id} thumb size={compact ? 26 : 30} />
            </span>
          ))
        ) : (
          <span className="no-items">nenhuma peça ainda</span>
        )}
      </div>
    </article>
  );
}
