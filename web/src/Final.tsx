import { useEffect, useRef, useState, type CSSProperties } from 'react';
import confetti from 'canvas-confetti';
import { ITEM_BY_ID, brl } from '../../shared/catalog.ts';
import { rankPlayers, type PublicRoom, type Ranked } from '../../shared/protocol.ts';
import { play } from './sound.ts';
import { Avatar, ItemImg, reducedMotion } from './ui.tsx';

const SLIDE_MS = 8500;
const END_TEXT = { time: 'O tempo acabou!', items: 'Acabaram os itens da roleta!', money: 'Todo mundo ficou sem saldo!', teacher: 'Partida encerrada pelo professor.' };

// Vermelho → laranja → verde conforme o percentual.
const hue = (p: number) => Math.round((Math.max(0, Math.min(100, p)) / 100) * 125);

function Meter({ percent, delay = 900 }: { percent: number; delay?: number }) {
  const fill = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(reducedMotion() ? percent : 0);
  useEffect(() => {
    if (reducedMotion()) return;
    let raf = 0;
    const t0 = performance.now() + delay;
    const timer = setTimeout(() => play('barra', 0.8), delay);
    const step = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / 2600));
      setShown(percent * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => (cancelAnimationFrame(raf), clearTimeout(timer));
  }, [percent, delay]);
  useEffect(() => {
    if (fill.current) fill.current.style.clipPath = `inset(0 ${100 - shown}% 0 0 round 999px)`;
  }, [shown]);
  return (
    <div className="meter">
      <div className="meter-head">
        <span>Computador funcional</span>
        <strong style={{ color: `hsl(${hue(shown)} 90% 58%)` }}>{Math.round(shown)}%</strong>
      </div>
      <div className="meter-track" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <div className="meter-fill" ref={fill} />
      </div>
    </div>
  );
}

function BuildGrid({ r, big }: { r: Ranked; big?: boolean }) {
  return (
    <div className={`build ${big ? 'build-big' : ''}`}>
      {r.score.slots.map((s, k) => (
        <div key={s.slot.id} className={`slot ${s.item ? 'has' : 'miss'}`} style={{ animationDelay: `${0.25 + k * 0.07}s` }}>
          {s.item ? <ItemImg id={s.item.id} thumb size={big ? 76 : 44} /> : <span className="x">✕</span>}
          <small>{s.slot.name}</small>
        </div>
      ))}
    </div>
  );
}

function Notes({ r }: { r: Ranked }) {
  const { missing, upgrades, extras } = r.score;
  return (
    <div className="notes">
      {missing.length > 0 && (
        <div className="note-row" style={{ animationDelay: '3.4s' }}>
          <b className="note-label bad">Faltou para 100%:</b>
          {missing.map((s) => (
            <span key={s.id} className="chip chip-bad" title={s.why}>
              {s.name} {missing.length <= 4 && <em>— {s.why}</em>}
            </span>
          ))}
        </div>
      )}
      {upgrades.length > 0 && (
        <div className="note-row" style={{ animationDelay: '3.8s' }}>
          <b className="note-label warn">Pode melhorar:</b>
          {upgrades.map((s) => (
            <span key={s.id} className="chip chip-warn">{s.name}</span>
          ))}
        </div>
      )}
      {extras.length > 0 && (
        <div className="note-row" style={{ animationDelay: '4.2s' }}>
          <b className="note-label">Acessórios (não ligam o PC):</b>
          {extras.map((it, k) => (
            <span key={it.id + k} className="chip chip-extra">{it.name}</span>
          ))}
        </div>
      )}
      {!missing.length && !upgrades.length && <p className="perfect">PC perfeito! Todas as peças no melhor nível. 🏆</p>}
    </div>
  );
}

function Slide({ r, index, total }: { r: Ranked; index: number; total: number }) {
  const p = r.player;
  return (
    <div className="slide" style={{ '--c': p.color } as CSSProperties}>
      <div className="slide-who">
        <p className="slide-count">{index + 1} de {total}</p>
        <Avatar color={p.color} size={150} />
        <h2>{p.name}</h2>
        <p>
          {p.items.length} {p.items.length === 1 ? 'peça' : 'peças'} · sobrou <b>{brl(p.balance)}</b>
        </p>
      </div>
      <div className="slide-body">
        <BuildGrid r={r} big />
        <Meter percent={r.score.percent} />
        <Notes r={r} />
      </div>
    </div>
  );
}

export function Podium({ ranking }: { ranking: Ranked[] }) {
  const order = [ranking[1], ranking[0], ranking[2]].filter(Boolean);
  return (
    <div className="podium">
      {order.map((r) => (
        <div key={r.player.id} className={`step step-${r.position}`} style={{ '--c': r.player.color } as CSSProperties}>
          <Avatar color={r.player.color} size={r.position === 1 ? 120 : 92} crown={r.position === 1} />
          <strong>{r.player.name}</strong>
          <span style={{ color: `hsl(${hue(r.score.percent)} 90% 60%)` }}>{Math.round(r.score.percent)}%</span>
          <div className="block">{r.position}º</div>
        </div>
      ))}
    </div>
  );
}

export function RankingTable({ ranking, meId }: { ranking: Ranked[]; meId?: string }) {
  return (
    <ol className="ranking">
      {ranking.map((r) => (
        <li key={r.player.id} className={r.player.id === meId ? 'me' : ''}>
          <span className="pos">{r.position}º</span>
          <Avatar color={r.player.color} size={30} />
          <span className="nm">{r.player.name}</span>
          <span className="bar"><i style={{ width: `${r.score.percent}%`, background: `hsl(${hue(r.score.percent)} 85% 55%)` }} /></span>
          <b>{Math.round(r.score.percent)}%</b>
          <small>{brl(r.player.balance)}</small>
        </li>
      ))}
    </ol>
  );
}

export const celebrate = () => {
  play('vitoria');
  if (reducedMotion()) return;
  const end = Date.now() + 2500;
  const shot = () => {
    confetti({ particleCount: 40, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true });
    confetti({ particleCount: 40, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true });
    if (Date.now() < end) setTimeout(shot, 250);
  };
  shot();
};

// Apresentação da TV (só na tela do professor): do menor percentual para o maior, depois o pódio.
export function FinalShow({ room, onReveal, onNew }: { room: PublicRoom; onReveal: () => void; onNew: () => void }) {
  const ranking = rankPlayers(room.players);
  const ascending = [...ranking].reverse();
  const n = ascending.length;
  const [step, setStep] = useState(-1); // -1 abertura, 0..n-1 alunos, n rufar, n+1 pódio
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || step > n) return;
    const ms = step === -1 ? 4000 : step < n ? SLIDE_MS : 4200;
    const id = setTimeout(() => setStep((s) => s + 1), ms);
    return () => clearTimeout(id);
  }, [step, paused, n]);
  useEffect(() => {
    if (step === n) play('rufar');
    if (step === n + 1) celebrate();
  }, [step, n]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setStep((s) => Math.min(n + 1, s + 1));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(-1, s - 1));
      if (e.key === ' ') (e.preventDefault(), setPaused((v) => !v));
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [n]);

  return (
    <div className="final">
      {step === -1 && (
        <div className="final-intro">
          <p className="eyebrow">{room.endReason ? END_TEXT[room.endReason] : 'Fim de jogo!'}</p>
          <h1>Hora da verdade</h1>
          <p>Quem montou o computador mais funcional? Vamos ver um por um, do menor para o maior.</p>
        </div>
      )}
      {step >= 0 && step < n && <Slide key={ascending[step].player.id} r={ascending[step]} index={step} total={n} />}
      {step === n && (
        <div className="final-intro drum">
          <h1>E os vencedores são…</h1>
          <div className="drums" aria-hidden="true">🥁</div>
        </div>
      )}
      {step === n + 1 && (
        <div className="final-podium">
          <h1>Pódio do LeilãoTEC</h1>
          <Podium ranking={ranking} />
          <RankingTable ranking={ranking} />
          <p className="lesson">
            Empate no percentual? Vence quem economizou mais. Gastar bem também é empreender! 💡
          </p>
        </div>
      )}
      <nav className="final-controls" aria-label="Controles da apresentação">
        <button className="icon-btn" onClick={() => setStep((s) => Math.max(-1, s - 1))} title="Voltar (←)">⏮</button>
        <button className="icon-btn" onClick={() => setPaused((v) => !v)} title="Pausar (espaço)">{paused ? '▶' : '⏸'}</button>
        <button className="icon-btn" onClick={() => setStep((s) => Math.min(n + 1, s + 1))} title="Próximo (→)">⏭</button>
        {step === n + 1 &&
          (room.revealed ? (
            <span className="pill">Resultado liberado para a turma ✓</span>
          ) : (
            <button className="btn btn-primary" onClick={onReveal}>Mostrar resultado para a turma</button>
          ))}
        {step === n + 1 && <button className="btn btn-ghost" onClick={onNew}>Nova partida</button>}
      </nav>
    </div>
  );
}

export function StudentFinal({ room, meId }: { room: PublicRoom; meId: string }) {
  const ranking = rankPlayers(room.players);
  const mine = ranking.find((r) => r.player.id === meId);
  const fired = useRef(false);
  useEffect(() => {
    if (room.revealed && mine?.position === 1 && !fired.current) {
      fired.current = true;
      celebrate();
    }
  }, [room.revealed, mine?.position]);
  if (!room.revealed) {
    return (
      <div className="tv-wait">
        <div className="tv-icon" aria-hidden="true">📺</div>
        <h1>Olhe para a TV!</h1>
        <p>O professor está apresentando o computador de cada um. O resultado aparece aqui depois.</p>
      </div>
    );
  }
  return (
    <div className="student-final">
      <h1>Resultado final</h1>
      <Podium ranking={ranking} />
      {mine && (
        <section className="my-result" style={{ '--c': mine.player.color } as CSSProperties}>
          <h2>
            Você ficou em <b>{mine.position}º</b> lugar
          </h2>
          <BuildGrid r={mine} />
          <Meter percent={mine.score.percent} delay={300} />
          <Notes r={mine} />
          {mine.score.extras.length === 0 && mine.player.items.length === 0 && <p className="muted">Você não arrematou nenhuma peça desta vez.</p>}
        </section>
      )}
      <RankingTable ranking={ranking} meId={meId} />
      <p className="muted small">Peças compradas: {mine?.player.items.map((id) => ITEM_BY_ID[id]?.name).join(', ') || 'nenhuma'}</p>
    </div>
  );
}
