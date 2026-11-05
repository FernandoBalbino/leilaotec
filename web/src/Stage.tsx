import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ITEM_BY_ID, brl } from '../../shared/catalog.ts';
import { BID_MS, INTRO_MS, SPIN_MS, minBid, type PublicPlayer, type PublicRoom } from '../../shared/protocol.ts';
import { onBid, send, serverNow } from './net.ts';
import { play } from './sound.ts';
import { Avatar, Countdown, ItemImg, Money, PlayerCard, lastBidBy, reducedMotion } from './ui.tsx';
import { Wheel } from './Wheel.tsx';

// true depois que a roleta parou (o servidor ainda está na fase "spinning" durante a apresentação do item).
function useLanded(room: PublicRoom) {
  const lot = room.lot;
  const calc = () => !!lot && (room.phase !== 'spinning' || serverNow() - lot.spinStartAt >= SPIN_MS);
  const [landed, setLanded] = useState(calc);
  useEffect(() => {
    setLanded(calc());
    if (!lot || room.phase !== 'spinning') return;
    const wait = SPIN_MS - (serverNow() - lot.spinStartAt);
    if (wait <= 0) return;
    const id = setTimeout(() => setLanded(true), wait);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lot?.spinStartAt, room.phase]);
  return landed;
}

function LotPanel({ room, compact }: { room: PublicRoom; compact?: boolean }) {
  const lot = room.lot!;
  const item = ITEM_BY_ID[lot.itemId];
  const hero = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState(false);
  const intro = room.phase === 'spinning';

  // O item aparece gigante no meio da tela e depois encolhe até o lugar dele no painel.
  useLayoutEffect(() => {
    const el = hero.current;
    const sinceLand = serverNow() - lot.spinStartAt - SPIN_MS;
    if (!intro || !el || sinceLand > 700) return;
    play('item');
    if (reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const img = el.querySelector('img')?.getBoundingClientRect() ?? r;
    const dx = innerWidth / 2 - (r.left + r.width / 2);
    const dy = innerHeight / 2 - (r.top + r.height / 2);
    const s = (Math.min(innerWidth, innerHeight) * 0.7) / Math.max(1, img.width);
    setSpot(true);
    const anim = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${s * 0.15}) rotate(-12deg)`, opacity: 0 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s * 1.08}) rotate(2deg)`, opacity: 1, offset: 0.2 },
        { transform: `translate(${dx}px, ${dy}px) scale(${s})`, offset: 0.6 },
        { transform: 'none' },
      ],
      { duration: INTRO_MS - 300, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
    anim.onfinish = () => setSpot(false);
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lot.spinStartAt]);

  const top = lot.secret ? undefined : lot.bids.at(-1);
  const leader = room.players.find((p) => p.id === top?.playerId);
  const bidding = room.phase === 'bidding';
  return (
    <section className={`lot ${lot.secret ? 'lot-secret' : ''} ${compact ? 'lot-compact' : ''} ${intro ? 'lot-intro' : ''}`}>
      {spot && <div className="spotlight" aria-hidden="true" />}
      {lot.secret && (
        <div className="secret-banner">
          🔒 LANCE SECRETO <span>um lance por pessoa · ninguém vê o valor</span>
        </div>
      )}
      <div className="lot-hero" ref={hero}>
        <div className="lot-halo" aria-hidden="true" />
        <ItemImg id={item.id} className="lot-img" />
        {item.tag && <span className="tag">{item.tag}</span>}
      </div>
      <div className="lot-info">
        <h2>{item.name}</h2>
        <p className="brand">{item.brand}</p>
        <div className="prices">
          <div>
            <small>Lance inicial</small>
            <strong>{brl(lot.startPrice)}</strong>
          </div>
          {!lot.secret && (
            <div className="top-bid">
              <small>Maior lance</small>
              {top?.amount ? (
                <strong className="top-amount">
                  <Money value={top.amount} />
                  {leader && (
                    <span className="leader-tag" style={{ '--c': leader.color } as CSSProperties}>
                      <Avatar color={leader.color} size={26} /> {leader.name}
                    </span>
                  )}
                </strong>
              ) : (
                <strong className="muted">ninguém ainda</strong>
              )}
            </div>
          )}
          {lot.secret && bidding && (
            <div className="top-bid">
              <small>Lances enviados</small>
              <strong>
                {new Set(lot.bids.map((b) => b.playerId)).size} de {room.players.length}
              </strong>
            </div>
          )}
        </div>
        {lot.secret && lot.round > 1 && bidding && <p className="redo">Empate! Rodada {lot.round} do lance secreto.</p>}
      </div>
      <div className="lot-timer">
        {bidding ? (
          <Countdown endsAt={lot.biddingEndsAt} total={BID_MS} size={compact ? 84 : 150} />
        ) : intro ? (
          <p className="get-ready">Prepare-se…</p>
        ) : null}
      </div>
    </section>
  );
}

function ResultOverlay({ room }: { room: PublicRoom }) {
  const lot = room.lot!;
  const res = lot.result!;
  const byId = (id: string | null) => room.players.find((p) => p.id === id);
  const winner = byId(res.winnerId);
  const item = ITEM_BY_ID[lot.itemId];
  return (
    <div className="overlay" role="status" aria-live="polite">
      <div className={`result-card result-${res.kind} ${lot.secret ? 'is-secret' : ''}`}>
        {res.kind === 'tie' && (
          <>
            <div className="stamp stamp-tie">EMPATE!</div>
            <p>
              Os maiores lances empataram em <b>{brl(res.price)}</b>. O lance secreto vai ser refeito!
            </p>
            <Reveal room={room} />
          </>
        )}
        {res.kind === 'none' && (
          <>
            <ItemImg id={item.id} size={140} />
            <div className="stamp stamp-none">SEM LANCES</div>
            <p>Ninguém arrematou. O item saiu da roleta.</p>
          </>
        )}
        {res.kind === 'sold' && winner && (
          <>
            {lot.secret && <p className="secret-title">🔒 Vencedor do lance secreto</p>}
            {lot.secret && <Reveal room={room} />}
            <div className="sold-row" style={{ animationDelay: lot.secret ? '2s' : '0s' }}>
              <ItemImg id={item.id} size={150} className="sold-item" />
              <div className="sold-who" style={{ '--c': winner.color } as CSSProperties}>
                <Avatar color={winner.color} size={96} />
                <strong>{winner.name}</strong>
                <span>levou por <b>{brl(res.price)}</b></span>
              </div>
            </div>
            <div className="stamp" style={{ animationDelay: lot.secret ? '2.1s' : '.1s' }}>VENDIDO!</div>
            {res.tiebreak && <p className="muted">Empatou de novo: venceu quem mandou o lance primeiro.</p>}
          </>
        )}
      </div>
    </div>
  );
}

// Abre os lances secretos um a um, do menor para o maior.
function Reveal({ room }: { room: PublicRoom }) {
  const res = room.lot!.result!;
  const list = res.revealed ?? [];
  return (
    <ol className="reveal-list">
      {list.map((b, k) => {
        const p = room.players.find((x) => x.id === b.playerId);
        const top = b.amount === res.price;
        return (
          <li key={b.playerId} className={top ? 'top' : ''} style={{ animationDelay: `${(k * 1.6) / Math.max(1, list.length)}s` }}>
            {p && <Avatar color={p.color} size={28} />}
            <span>{p?.name ?? 'saiu'}</span>
            <b>{brl(b.amount ?? 0)}</b>
          </li>
        );
      })}
    </ol>
  );
}

function BidControls({ room, me, secretBid, setSecretBid }: { room: PublicRoom; me: PublicPlayer; secretBid: number | null; setSecretBid: (v: number | null) => void }) {
  const lot = room.lot!;
  const open = room.phase === 'bidding';
  const min = minBid(lot);
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const leading = !lot.secret && lot.bids.at(-1)?.playerId === me.id;
  const myBid = lastBidBy(lot, me.id);

  useEffect(() => {
    setValue('');
    setConfirm(null);
    setMsg(null);
  }, [lot.spinStartAt, lot.round]);

  const place = async (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return setMsg({ text: 'Digite um valor.' });
    setBusy(true);
    const r = await send('player:bid', { amount: Math.round(amount) });
    setBusy(false);
    setConfirm(null);
    if (!r.ok) return setMsg({ text: r.error });
    setValue('');
    if (lot.secret) setSecretBid(Math.round(amount));
    setMsg({ text: lot.secret ? 'Lance secreto enviado! 🤫' : 'Lance enviado! 🔨', ok: true });
  };

  if (!open) {
    return <div className="bid-box disabled">{room.phase === 'result' ? 'Lances encerrados.' : 'Os lances abrem já já…'}</div>;
  }
  if (lot.secret && myBid) {
    return (
      <div className="bid-box sent">
        <span>Seu lance secreto</span>
        <strong>{secretBid ? brl(secretBid) : '🔒 enviado'}</strong>
        <small>Aguarde o fim do tempo para ver quem ganhou.</small>
      </div>
    );
  }
  const quick = lot.secret ? [] : [min, min + 40, min + 90];
  const custom = Number(value);
  return (
    <div className={`bid-box ${lot.secret ? 'secret' : ''}`}>
      <div className="bid-head">
        <span>Seu saldo: <b><Money value={me.balance} /></b></span>
        <span>Mínimo: <b>{brl(min)}</b></span>
      </div>
      {leading ? (
        <p className="leading">👑 Você tem o maior lance! Espere alguém cobrir.</p>
      ) : (
        <>
          {quick.length > 0 && (
            <div className="quick">
              {quick.map((v, k) => (
                <button key={k} className="btn btn-quick" disabled={busy || v > me.balance} onClick={() => place(v)}>
                  <small>{[lot.bids.length ? 'Cobrir' : 'Lance inicial', '+ R$ 50', '+ R$ 100'][k]}</small>
                  {brl(v)}
                </button>
              ))}
            </div>
          )}
          <form
            className="custom"
            onSubmit={(e) => {
              e.preventDefault();
              if (lot.secret && confirm !== custom) return setConfirm(custom);
              place(custom);
            }}
          >
            <label>
              <span>{lot.secret ? 'Seu lance secreto (só pode um!)' : 'Outro valor'}</span>
              <input
                inputMode="numeric"
                type="number"
                min={min}
                max={me.balance}
                step={10}
                placeholder={String(min)}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setConfirm(null);
                }}
              />
            </label>
            <button className={`btn ${lot.secret ? 'btn-secret' : 'btn-primary'}`} disabled={busy || !value}>
              {lot.secret ? (confirm === custom && value ? `Confirmar ${brl(custom)}?` : 'Enviar lance secreto') : 'Dar lance'}
            </button>
          </form>
        </>
      )}
      {msg && <p className={`bid-msg ${msg.ok ? 'ok' : 'err'}`} role="alert">{msg.text}</p>}
    </div>
  );
}

export function Stage({ room, meId, secretBid, setSecretBid }: { room: PublicRoom; meId?: string; secretBid?: number | null; setSecretBid?: (v: number | null) => void }) {
  const landed = useLanded(room);
  const lot = room.lot;
  const student = !!meId;
  const [pulse, setPulse] = useState<string | null>(null);

  useEffect(
    () =>
      onBid((bid) => {
        setPulse(bid.playerId);
        play('lance', 0.6);
      }),
    [],
  );
  useEffect(() => {
    if (!pulse) return;
    const id = setTimeout(() => setPulse(null), 700);
    return () => clearTimeout(id);
  }, [pulse]);

  if (!lot) return null;
  if (room.phase === 'spinning' && !landed) {
    return (
      <div className="spin-stage">
        <h2 className="spin-title">Sorteando o próximo item…</h2>
        <Wheel items={room.wheel} secret={room.secretItems} lot={lot} />
      </div>
    );
  }
  const me = room.players.find((p) => p.id === meId);
  const players = student
    ? [...room.players].sort((a, b) => (b.id === meId ? 1 : 0) - (a.id === meId ? 1 : 0) || (lastBidBy(lot, b.id)?.amount ?? 0) - (lastBidBy(lot, a.id)?.amount ?? 0))
    : room.players;
  const n = players.length;
  const cols = student ? undefined : n <= 4 ? 2 : n <= 9 ? 3 : n <= 16 ? 4 : n <= 25 ? 5 : 6;
  return (
    <div className={student ? 'st-stage' : 'tv-stage'}>
      <LotPanel room={room} compact={student} />
      {student && me && setSecretBid && <BidControls room={room} me={me} secretBid={secretBid ?? null} setSecretBid={setSecretBid} />}
      <section className={`players ${cols && n > 8 ? 'fill' : ''}`} style={cols ? ({ '--cols': cols, '--rows': Math.ceil(n / cols) } as CSSProperties) : undefined} aria-label="Alunos e lances">
        {players.map((p) => (
          <div key={p.id} className={pulse === p.id ? 'pulse' : ''} style={{ '--c': p.color } as CSSProperties}>
            <PlayerCard player={p} lot={lot} me={p.id === meId} compact={student || n > 20} />
          </div>
        ))}
      </section>
      {room.phase === 'result' && lot.result && <ResultOverlay key={`${lot.spinStartAt}-${lot.round}`} room={room} />}
    </div>
  );
}
