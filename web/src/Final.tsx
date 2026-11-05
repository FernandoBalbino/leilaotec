import { useEffect, useRef, useState, type CSSProperties } from 'react';
import confetti from 'canvas-confetti';
import { brl } from '../../shared/catalog.ts';
import { MISSION_BY_ID, type Mission } from '../../shared/missions.ts';
import { rankPlayers, type MatchSettings, type PublicRoom, type Ranked } from '../../shared/protocol.ts';
import { MissionCard } from './Mission.tsx';
import { AnswersPanel, Quiz } from './Quiz.tsx';
import { SettingsForm } from './Settings.tsx';
import { Avatar, ItemImg, reducedMotion } from './ui.tsx';

const SLIDE_MS = 8500;
const MISSION_SLIDE_MS = 11000; // tempo extra para ler a missão na TV
const END_TEXT = { time: 'O tempo acabou!', items: 'Acabaram os itens da roleta!', money: 'Todo mundo ficou sem saldo!', teacher: 'Partida encerrada pelo professor.' };

// Vermelho → laranja → verde conforme o percentual.
const hue = (p: number) => Math.round((Math.max(0, Math.min(100, p)) / 100) * 125);
const missionOf = (room: PublicRoom, playerId: string) => (room.missions ? MISSION_BY_ID[room.missions[playerId]] : undefined);

function Meter({ percent, delay = 900, label }: { percent: number; delay?: number; label: string }) {
  const fill = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(reducedMotion() ? percent : 0);
  useEffect(() => {
    if (reducedMotion()) return;
    let raf = 0;
    const t0 = performance.now() + delay;
    const step = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / 2600));
      setShown(percent * (1 - (1 - k) ** 3));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [percent, delay]);
  useEffect(() => {
    if (fill.current) fill.current.style.clipPath = `inset(0 ${100 - shown}% 0 0 round 999px)`;
  }, [shown]);
  return (
    <div className="meter">
      <div className="meter-head">
        <span>{label}</span>
        <strong style={{ color: `hsl(${hue(shown)} 90% 58%)` }}>{Math.round(shown)}%</strong>
      </div>
      <div className="meter-track" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <div className="meter-fill" ref={fill} />
      </div>
    </div>
  );
}

function BuildGrid({ r, big }: { r: Ranked; big?: boolean }) {
  const size = big ? 76 : 44;
  return (
    <div className={`build ${big ? 'build-big' : ''}`}>
      {r.score.slots.map((s, k) => (
        <div key={s.slot.id} className={`slot slot-${s.status}`} style={{ animationDelay: `${0.25 + k * 0.07}s` }}>
          {s.item ? <ItemImg id={s.item.id} thumb size={size} /> : <span className="x">{s.status === 'skip' ? '—' : '✕'}</span>}
          <small>{s.slot.name}</small>
          {s.status === 'weak' && <em className="slot-flag">fraca</em>}
          {s.status === 'skip' && <em className="slot-flag">não precisa</em>}
        </div>
      ))}
      {r.score.wanted.map((w, k) => (
        <div key={w.item.id} className={`slot slot-wanted ${w.owned ? 'slot-ok' : 'slot-missing'}`} style={{ animationDelay: `${1.1 + k * 0.07}s` }}>
          <ItemImg id={w.item.id} thumb size={size} className={w.owned ? '' : 'ghost'} />
          <small>{w.item.name}</small>
          <em className="slot-flag">{w.owned ? 'pedido ✓' : 'pedido'}</em>
        </div>
      ))}
    </div>
  );
}

function Notes({ r, mission }: { r: Ranked; mission?: Mission }) {
  const { missing, upgrades, extras, weak, wanted } = r.score;
  const lacking = wanted.filter((w) => !w.owned);
  const perfect = !missing.length && !upgrades.length && !weak.length && !lacking.length;
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
      {weak.length > 0 && (
        <div className="note-row" style={{ animationDelay: '3.7s' }}>
          <b className="note-label warn">Fraca para o cliente:</b>
          {weak.map((s) => (
            <span key={s.id} className="chip chip-warn">{s.name}</span>
          ))}
        </div>
      )}
      {lacking.length > 0 && (
        <div className="note-row" style={{ animationDelay: '3.9s' }}>
          <b className="note-label bad">O cliente também pedia:</b>
          {lacking.map((w) => (
            <span key={w.item.id} className="chip chip-bad">{w.item.name}</span>
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
          <b className="note-label">{mission ? 'Acessórios que o cliente não pediu:' : 'Acessórios (não ligam o PC):'}</b>
          {extras.map((it, k) => (
            <span key={it.id + k} className="chip chip-extra">{it.name}</span>
          ))}
        </div>
      )}
      {mission && <p className="lesson-line" style={{ animationDelay: '4.6s' }}>💡 {mission.lesson}</p>}
      {perfect && <p className="perfect">{mission ? 'Missão cumprida! O cliente saiu feliz da loja. 🏆' : 'PC perfeito! Todas as peças no melhor nível. 🏆'}</p>}
    </div>
  );
}

function Slide({ r, index, total, mission }: { r: Ranked; index: number; total: number; mission?: Mission }) {
  const p = r.player;
  return (
    <div className="slide" style={{ '--c': p.color } as CSSProperties}>
      <div className="slide-who">
        <p className="slide-count">{index + 1} de {total}</p>
        <Avatar color={p.color} size={mission ? 110 : 150} />
        <h2>{p.name}</h2>
        <p>
          {p.items.length} {p.items.length === 1 ? 'peça' : 'peças'} · sobrou <b>{brl(p.balance)}</b>
        </p>
        {mission && <MissionCard mission={mission} reveal />}
      </div>
      <div className="slide-body">
        <BuildGrid r={r} big />
        <Meter percent={r.score.percent} label={mission ? 'Missão cumprida' : 'Computador funcional'} delay={mission ? 1400 : 900} />
        <Notes r={r} mission={mission} />
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

export function RankingTable({ ranking, meId, room }: { ranking: Ranked[]; meId?: string; room: PublicRoom }) {
  return (
    <ol className="ranking">
      {ranking.map((r) => {
        const m = missionOf(room, r.player.id);
        return (
          <li key={r.player.id} className={r.player.id === meId ? 'me' : ''}>
            <span className="pos">{r.position}º</span>
            <Avatar color={r.player.color} size={30} />
            <span className="nm">{r.player.name}{m && <small className="nm-mission"> {m.emoji} {m.title}</small>}</span>
            <span className="bar"><i style={{ width: `${r.score.percent}%`, background: `hsl(${hue(r.score.percent)} 85% 55%)` }} /></span>
            <b>{Math.round(r.score.percent)}%</b>
            <small>{brl(r.player.balance)}</small>
          </li>
        );
      })}
    </ol>
  );
}

export const celebrate = () => {
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
export function FinalShow({ room, onReveal, onRestart, onLeave }: {
  room: PublicRoom;
  onReveal: () => void;
  onRestart: (s: MatchSettings) => Promise<string>;
  onLeave: () => void;
}) {
  const ranking = rankPlayers(room.players, room.missions);
  const ascending = [...ranking].reverse();
  const n = ascending.length;
  const mission = room.mode === 'mission';
  const [step, setStep] = useState(-1); // -1 abertura, 0..n-1 alunos, n rufar, n+1 pódio
  const [paused, setPaused] = useState(false);
  const [panel, setPanel] = useState<'answers' | 'restart' | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (paused || step > n || panel) return;
    const ms = step === -1 ? 4000 : step < n ? (mission ? MISSION_SLIDE_MS : SLIDE_MS) : 4200;
    const id = setTimeout(() => setStep((s) => s + 1), ms);
    return () => clearTimeout(id);
  }, [step, paused, n, panel, mission]);
  useEffect(() => {
    if (step === n + 1) celebrate();
  }, [step, n]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (panel) return;
      if (e.key === 'ArrowRight') setStep((s) => Math.min(n + 1, s + 1));
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(-1, s - 1));
      if (e.key === ' ') (e.preventDefault(), setPaused((v) => !v));
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [n, panel]);

  const missingAnswers = room.players.length - room.answered.length;
  return (
    <div className="final">
      {step === -1 && (
        <div className="final-intro">
          <p className="eyebrow">{room.endReason ? END_TEXT[room.endReason] : 'Fim de jogo!'}</p>
          <h1>Hora da verdade</h1>
          <p>
            {mission
              ? 'Cada um tinha um cliente secreto. Quem atendeu melhor o seu cliente? Vamos ver um por um, do menor para o maior.'
              : 'Quem montou o computador mais funcional? Vamos ver um por um, do menor para o maior.'}
          </p>
        </div>
      )}
      {step >= 0 && step < n && (
        <Slide key={ascending[step].player.id} r={ascending[step]} index={step} total={n} mission={missionOf(room, ascending[step].player.id)} />
      )}
      {step === n && (
        <div className="final-intro drum">
          <h1>E os vencedores são…</h1>
          <div className="drums" aria-hidden="true">🥁</div>
        </div>
      )}
      {step === n + 1 && (
        <div className="final-podium">
          <h1>{mission ? 'Melhores atendimentos' : 'Pódio do LeilãoTEC'}</h1>
          <Podium ranking={ranking} />
          <RankingTable ranking={ranking} room={room} />
          <p className="lesson">
            {mission
              ? 'O melhor técnico não é o que vende a peça mais cara: é o que entende o que o cliente precisa. 💡'
              : 'Empate no percentual? Vence quem economizou mais. Gastar bem também é empreender! 💡'}
          </p>
        </div>
      )}
      <nav className="final-controls" aria-label="Controles da apresentação">
        <button className="icon-btn" onClick={() => setStep((s) => Math.max(-1, s - 1))} title="Voltar (←)">⏮</button>
        <button className="icon-btn" onClick={() => setPaused((v) => !v)} title="Pausar (espaço)">{paused ? '▶' : '⏸'}</button>
        <button className="icon-btn" onClick={() => setStep((s) => Math.min(n + 1, s + 1))} title="Próximo (→)">⏭</button>
        {step === n + 1 &&
          (room.revealed ? (
            <button className="btn btn-sm" onClick={() => setPanel('answers')}>📝 Respostas: {room.answered.length} de {room.players.length}</button>
          ) : (
            <button className="btn btn-primary" onClick={onReveal}>Mostrar resultado para a turma</button>
          ))}
        {step === n + 1 && room.revealed && <button className="btn btn-primary" onClick={() => setPanel('restart')}>Nova partida</button>}
      </nav>
      {panel === 'answers' && <AnswersPanel room={room} onClose={() => setPanel(null)} />}
      {panel === 'restart' && (
        <div className="overlay" role="dialog" aria-label="Nova partida">
          <div className="answers-card">
            <header>
              <h2>Nova partida na sala {room.code}</h2>
              <button className="icon-btn" onClick={() => setPanel(null)} aria-label="Fechar">✕</button>
            </header>
            <p className="muted">Os alunos continuam na sala e não precisam digitar o código de novo. Saldos e peças começam do zero.</p>
            {missingAnswers > 0 && <p className="notice">Ainda faltam {missingAnswers} {missingAnswers === 1 ? 'aluno responder' : 'alunos responderem'} as perguntas.</p>}
            <SettingsForm
              initial={{ startingBalance: room.startingBalance, matchMinutes: room.matchMinutes, mode: 'mission' }}
              submitLabel="Abrir nova partida"
              busy={busy}
              error={error}
              onSubmit={async (s) => {
                setBusy(true);
                setError(await onRestart(s));
                setBusy(false);
              }}
            >
              <button className="btn btn-sm btn-ghost leave" onClick={() => confirm('Fechar a sala? Os alunos vão precisar de um código novo.') && onLeave()}>
                Fechar a sala e voltar ao início
              </button>
            </SettingsForm>
          </div>
        </div>
      )}
    </div>
  );
}

export function StudentFinal({ room, meId }: { room: PublicRoom; meId: string }) {
  const ranking = rankPlayers(room.players, room.missions);
  const mine = ranking.find((r) => r.player.id === meId);
  const mission = missionOf(room, meId);
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
        <p>O professor está apresentando o resultado de cada um. O seu aparece aqui depois.</p>
      </div>
    );
  }
  return (
    <div className="student-final">
      <h1>Resultado final</h1>
      {mine && !room.answered.includes(meId) && (
        <button className="btn btn-primary quiz-cta" onClick={() => document.getElementById('quiz')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })}>
          📝 Responder as 5 perguntas ⬇
        </button>
      )}
      <Podium ranking={ranking} />
      {mine && (
        <section className="my-result" style={{ '--c': mine.player.color } as CSSProperties}>
          <h2>
            Você ficou em <b>{mine.position}º</b> lugar
          </h2>
          {mission && <MissionCard mission={mission} reveal />}
          <BuildGrid r={mine} />
          <Meter percent={mine.score.percent} delay={300} label={mission ? 'Missão cumprida' : 'Computador funcional'} />
          <Notes r={mine} mission={mission} />
        </section>
      )}
      {mine && <Quiz room={room} meId={meId} />}
      <RankingTable ranking={ranking} meId={meId} room={room} />
    </div>
  );
}
