import type { ReactNode } from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { Avatar, Bg, Burst, C, Cursor, DISPLAY, FONT, Item, Lock, PLAYERS, Points, Sfx, Stamp, brl, ease, lerp, useCue, type Who } from '../kit';

type Bid = [frame: number, who: Who, amount: number];
const last = (bids: Bid[], f: number, who?: Who) => [...bids].reverse().find((b) => b[0] <= f && (!who || b[1] === who));

function Lot({ id, name, start, children, secret }: { id: string; name: string; start: number; children?: ReactNode; secret?: boolean }) {
  const { frame } = useCue();
  return (
    <div style={{ position: 'absolute', left: 80, top: 130, width: 740, height: 860, borderRadius: 36, padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
      background: secret ? 'linear-gradient(180deg, rgba(224,81,255,.24), rgba(80,20,120,.12))' : 'linear-gradient(180deg, rgba(124,92,255,.16), rgba(255,255,255,.03))',
      border: `2px solid ${secret ? 'rgba(224,81,255,.5)' : C.line}`, boxShadow: secret ? '0 0 80px -20px rgba(224,81,255,.7)' : 'none', fontFamily: FONT, color: C.text }}>
      <div style={{ position: 'relative', width: 380, height: 380, display: 'grid', placeItems: 'center' }}>
        <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle, ${secret ? 'rgba(224,81,255,.55)' : 'rgba(124,92,255,.55)'}, transparent 70%)`, scale: 1 + Math.sin(frame / 14) * 0.06 }} />
        <div style={{ translate: `0 ${Math.sin(frame / 18) * 10}px` }}><Item id={id} size={340} /></div>
      </div>
      <div style={{ font: `800 52px ${DISPLAY}`, textAlign: 'center' }}>{name}</div>
      <div style={{ font: `600 30px ${FONT}`, color: C.soft }}>Lance inicial <b style={{ color: C.gold }}>{brl(start)}</b></div>
      {children}
    </div>
  );
}

function Countdown({ secs, size = 190 }: { secs: number; size?: number }) {
  const r = 44, c = 2 * Math.PI * r, danger = secs <= 5;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, rotate: '-90deg' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={danger ? C.danger : C.accent2} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - secs / 60)} />
      </svg>
      <span style={{ font: `800 ${size * 0.34}px ${DISPLAY}`, color: danger ? C.danger : C.text }}>{Math.ceil(secs)}</span>
    </div>
  );
}

function PlayerCard({ who, x, y, children, leader }: { who: Who; x: number; y: number; children: ReactNode; leader?: boolean }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 470, height: 180, borderRadius: 26, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 20, fontFamily: FONT,
      background: leader ? 'linear-gradient(180deg, rgba(255,201,64,.18), rgba(255,255,255,.03))' : 'rgba(255,255,255,.05)',
      border: `3px solid ${leader ? C.gold : `${PLAYERS[who]}55`}`, boxShadow: leader ? `0 0 0 2px ${C.gold}, 0 18px 40px -16px rgba(255,201,64,.8)` : 'none' }}>
      <div style={{ position: 'relative' }}>
        <Avatar who={who} size={84} />
        {leader && <span style={{ position: 'absolute', top: -34, left: 18, fontSize: 44 }}>👑</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0, font: `700 34px ${DISPLAY}`, color: C.text }}>{who}</div>
      {children}
    </div>
  );
}

const CARDS: [Who, number, number][] = [['Ana', 880, 130], ['Bruno', 1370, 130], ['Carla', 880, 330], ['Davi', 1370, 330]];
const BTN = (k: number) => [920 + k * 300 + 140, 805] as const; // centro de cada botão rápido

export const S4 = () => {
  const { frame, at, p } = useCue();
  const mid = (a: string, b: string) => Math.round((at(a) + at(b)) / 2);
  const bids: Bid[] = [
    [at('all'), 'Bruno', 450], [at('all') + 12, 'Carla', 460], [at('all') + 24, 'Davi', 470],
    [at('cover'), 'Ana', 480], [mid('cover', 'p50'), 'Bruno', 500], [at('p50'), 'Ana', 550], [mid('p50', 'p100'), 'Davi', 560], [at('p100'), 'Ana', 660],
  ];
  const top = last(bids, frame);
  const high = top?.[2] ?? 0;
  const secs = frame < at('end') ? ease(frame, [at('minute'), at('end')], [60, 5], Easing.linear) : ease(frame, [at('end'), at('sold') - 2], [5, 0], Easing.linear);
  const sold = p('sold', 0.5);
  const pay = p('pay', 1.2);
  const quick = [['Cobrir', high + 10], ['+ R$ 50', high + 50], ['+ R$ 100', high + 100]] as const;
  const pressed = [at('cover'), at('p50'), at('p100')];
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Bg />
      <Lot id="cpu-r5" name="Processador Ryzen 5" start={450}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 22px', borderRadius: 20, background: 'rgba(0,0,0,.3)', border: '2px solid rgba(255,201,64,.45)', minWidth: 460, opacity: top ? 1 : 0.4 }}>
          <span style={{ font: `600 26px ${FONT}`, color: C.muted }}>Maior lance</span>
          <span style={{ font: `800 54px ${DISPLAY}`, color: C.gold }}>{top ? brl(high) : '—'}</span>
          {top && <Avatar who={top[1]} size={52} />}
        </div>
        <div style={{ marginTop: 6, opacity: ease(frame, [at('minute') - 4, at('minute') + 6], [0, 1]) }}><Countdown secs={secs} /></div>
      </Lot>
      {CARDS.map(([who, x, y]) => {
        const b = last(bids, frame, who);
        return (
          <PlayerCard key={who} who={who} x={x} y={y} leader={!!b && top?.[1] === who && sold === 0}>
            {b ? <span key={b[0]} style={{ font: `800 46px ${DISPLAY}`, whiteSpace: 'nowrap', color: top?.[1] === who ? C.gold : C.text, scale: ease(frame, [b[0], b[0] + 10], [1.4, 1]) }}>{brl(b[2])}</span>
              : <span style={{ font: `500 28px ${FONT}`, color: C.muted }}>pensando…</span>}
          </PlayerCard>
        );
      })}
      {bids.map(([f]) => <Sfx key={f} at={f} src="lance" volume={0.35} len={20} />)}
      {/* caixa de lance da Ana */}
      <div style={{ position: 'absolute', left: 880, top: 560, width: 960, height: 430, borderRadius: 32, padding: 40, background: 'linear-gradient(180deg, rgba(34,211,238,.12), rgba(255,255,255,.03))', border: '2px solid rgba(34,211,238,.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: `600 32px ${FONT}`, color: C.soft }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Avatar who="Ana" size={52} /> Sua vez, Ana</span>
          <span>Saldo <b style={{ font: `800 44px ${DISPLAY}`, color: C.text }}>{brl(Math.round(lerp(pay, 3000, 2340) / 10) * 10)}</b></span>
        </div>
        <div style={{ position: 'absolute', left: 40, top: 150, display: 'flex', gap: 20 }}>
          {quick.map(([label, v], k) => {
            const d = frame - pressed[k];
            return (
              <div key={label} style={{ width: 280, height: 190, borderRadius: 24, display: 'grid', placeItems: 'center', alignContent: 'center', gap: 6, background: 'rgba(124,92,255,.22)', border: '2px solid rgba(124,92,255,.55)',
                scale: d >= 0 && d < 8 ? 0.92 : 1, boxShadow: d >= 0 && d < 14 ? `0 0 0 6px ${C.accent2}` : 'none', opacity: sold ? 0.4 : 1 }}>
                <span style={{ font: `600 30px ${FONT}`, color: C.muted }}>{label}</span>
                <span style={{ font: `800 54px ${DISPLAY}` }}>{brl(v)}</span>
              </div>
            );
          })}
        </div>
        <Points p={pay} text={`-${brl(660)}`} color={C.danger} x={760} y={60} size={64} />
      </div>
      <Cursor path={[[at('cover', -0.7), 1300, 700], [at('cover', -0.1), ...BTN(0)], [at('p50', -0.1), ...BTN(1)], [at('p100', -0.1), ...BTN(2)], [at('end'), 1700, 980]]} clicks={pressed.map((f) => Math.round(f - 2))} />
      {/* vendido */}
      <Sfx at={at('end')} src="contagem" volume={0.6} />
      <Sfx at={at('sold')} src="ding" volume={0.7} />
      <AbsoluteFill style={{ opacity: ease(frame, [at('sold'), at('sold') + 6], [0, 1]) * ease(frame, [at('pay', 1.4), at('pay', 1.8)], [1, 0]), background: 'rgba(5,6,18,.82)', display: 'grid', placeItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
          <Stamp p={sold} size={150} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, font: `800 60px ${DISPLAY}`, opacity: p('sold', 0.4, 0.3) }}>
            <Avatar who="Ana" size={96} /> Ana · <span style={{ color: C.gold }}>{brl(660)}</span>
          </div>
        </div>
      </AbsoluteFill>
      <Burst p={p('sold', 0.8)} x={960} y={500} r={340} color={C.ok} />
    </AbsoluteFill>
  );
};

const SECRET: [Who, number][] = [['Davi', 380], ['Bruno', 450], ['Ana', 520], ['Carla', 610]];

export const S5 = () => {
  const { frame, at, p, pop } = useCue();
  const revealAt = (k: number) => lerp(k / (SECRET.length - 1), at('reveal', 0.3), at('win', -0.3));
  const sent = (who: Who) => (who === 'Ana' ? at('one', 1.2) : at('hidden', ['Bruno', 'Carla', 'Davi'].indexOf(who) * 0.25));
  const anaTyped = '520'.slice(0, Math.max(0, Math.min(3, Math.floor((frame - at('one', 0.2)) / 4) + 1)));
  const result = ease(frame, [at('reveal'), at('reveal') + 8], [0, 1]);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Bg tint={C.secret} />
      <Lot id="mon-27g" name="Monitor gamer 27" start={300} secret>
        <div style={{ scale: pop('lock'), font: `800 40px ${DISPLAY}`, color: '#fff', background: 'linear-gradient(90deg, #8a1fb8, #e051ff)', padding: '14px 34px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 0 40px rgba(224,81,255,.6)' }}>
          <Lock size={40} color="#fff" /> LANCE SECRETO
        </div>
        <div style={{ font: `600 28px ${FONT}`, color: '#f0b3ff', opacity: p('one') }}>Um lance só, às cegas</div>
      </Lot>
      <Sfx at={at('lock')} src="switch" volume={0.6} />
      {CARDS.map(([who, x, y]) => (
        <PlayerCard key={who} who={who} x={x} y={y}>
          {frame >= sent(who) ? <span style={{ display: 'flex', alignItems: 'center', gap: 10, font: `700 32px ${FONT}`, color: '#f0b3ff', scale: ease(frame, [sent(who), sent(who) + 10], [1.4, 1]) }}><Lock size={32} color="#f0b3ff" /> enviado</span>
            : <span style={{ font: `500 28px ${FONT}`, color: C.muted }}>pensando…</span>}
        </PlayerCard>
      ))}
      <div style={{ position: 'absolute', left: 880, top: 560, width: 960, height: 430, borderRadius: 32, padding: 40, background: 'linear-gradient(180deg, rgba(224,81,255,.16), rgba(255,255,255,.03))', border: '2px solid rgba(224,81,255,.45)', display: 'grid', alignContent: 'center', gap: 26 }}>
        {frame < at('one', 1.2) ? (
          <>
            <div style={{ font: `600 30px ${FONT}`, color: C.soft }}>Seu lance secreto (só pode um!)</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ flex: 1, height: 110, borderRadius: 20, background: 'rgba(0,0,0,.35)', border: `2px solid ${C.secret}`, display: 'flex', alignItems: 'center', padding: '0 30px', font: `800 60px ${DISPLAY}` }}>R$ {anaTyped}</div>
              <div style={{ width: 380, height: 110, borderRadius: 20, display: 'grid', placeItems: 'center', font: `700 32px ${FONT}`, background: 'linear-gradient(135deg, #b02cff, #e051ff)', scale: frame >= at('one', 1) && frame < at('one', 1.2) ? 0.92 : 1 }}>Enviar lance secreto</div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', display: 'grid', gap: 16, scale: ease(frame, [at('one', 1.2), at('one', 1.5)], [0.8, 1], Easing.back(2)) }}>
            <span style={{ font: `700 40px ${FONT}`, color: C.ok }}>Lance secreto enviado! 🤫</span>
            <span style={{ font: `800 96px ${DISPLAY}`, color: '#f0b3ff' }}>{brl(520)}</span>
            <span style={{ font: `500 28px ${FONT}`, color: C.muted }}>Ninguém mais vê esse valor.</span>
          </div>
        )}
      </div>
      <Cursor path={[[at('one'), 1300, 900], [at('one', 0.9), 1610, 808], [at('hidden'), 1750, 1000]]} clicks={[Math.round(at('one', 1))]} />
      {/* revelação, do menor para o maior */}
      <AbsoluteFill style={{ opacity: result, background: 'rgba(5,6,18,.82)', display: 'grid', placeItems: 'center' }}>
        <div style={{ width: 1000, padding: 50, borderRadius: 40, background: 'linear-gradient(180deg, #23124a, #0c0f2c)', border: '2px solid rgba(224,81,255,.5)', boxShadow: '0 0 100px -20px rgba(224,81,255,.6)', display: 'grid', gap: 18,
          scale: ease(result, [0, 1], [0.9, 1]) }}>
          <div style={{ font: `800 52px ${DISPLAY}`, color: '#f0b3ff', textAlign: 'center', marginBottom: 10 }}>🔒 Os lances secretos eram…</div>
          {SECRET.map(([who, v], k) => {
            const t = revealAt(k), win = k === SECRET.length - 1 && frame >= at('win');
            return (
              <div key={who} style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '14px 26px', borderRadius: 20, opacity: ease(frame, [t, t + 8], [0, 1]), translate: `${ease(frame, [t, t + 10], [60, 0])}px 0`,
                background: win ? 'linear-gradient(90deg, rgba(255,201,64,.35), rgba(255,201,64,.08))' : 'rgba(255,255,255,.07)', boxShadow: win ? `0 0 0 3px ${C.gold}` : 'none' }}>
                <Avatar who={who} size={64} />
                <span style={{ flex: 1, font: `700 40px ${DISPLAY}` }}>{who}{win && ' 👑 leva!'}</span>
                <span style={{ font: `800 50px ${DISPLAY}`, color: win ? C.gold : C.text }}>{brl(v)}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {SECRET.map((_, k) => <Sfx key={k} at={revealAt(k)} src="switch" volume={0.4} len={20} />)}
      <Sfx at={at('win')} src="ding" volume={0.7} />
      <Burst p={p('win', 0.8)} x={960} y={780} r={320} />
    </AbsoluteFill>
  );
};
