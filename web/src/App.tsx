import { useEffect, useState, type CSSProperties } from 'react';
import { brl } from '../../shared/catalog.ts';
import type { PublicRoom } from '../../shared/protocol.ts';
import { SERVER_URL, clearRoom, loadSession, saveSession, send, socket, useConnected, useRoom, type Session } from './net.ts';
import { initMuted, preloadSounds } from './sound.ts';
import { FinalShow, StudentFinal } from './Final.tsx';
import { Stage } from './Stage.tsx';
import { Avatar, ItemImg, Logo, MatchClock, SoundToggle, SvgDefs } from './ui.tsx';

const SHOWCASE = ['gpu-gamer', 'ram-32g', 'cpu-r9', 'mon-27g', 'kb-gamer', 'nvme-1t', 'case-gamer', 'water'];
const JOIN_URL = `${location.origin}${import.meta.env.BASE_URL}`;

export function App() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [notice, setNotice] = useState('');
  const [secretBid, setSecretBid] = useState<number | null>(null);
  const room = useRoom();
  const connected = useConnected();

  const update = (s: Session | null) => {
    saveSession(s);
    setSession(s);
    if (!s) clearRoom();
  };

  // Volta para a sala sozinho a cada (re)conexão.
  useEffect(() => {
    const resume = async () => {
      const s = loadSession();
      if (!s) return;
      if (s.role === 'teacher') {
        const r = await send('teacher:resume', { code: s.code, token: s.token });
        if (!r.ok) (update(null), setNotice(r.error));
      } else {
        const r = await send('player:resume', { code: s.code, token: s.token });
        if (r.ok) setSecretBid(r.secretBid);
        else (update(null), setNotice(r.error));
      }
    };
    socket.on('connect', resume);
    if (socket.connected) resume();
    const kicked = () => (update(null), setNotice('O professor removeu você da sala.'));
    socket.on('kicked', kicked);
    return () => void (socket.off('connect', resume), socket.off('kicked', kicked));
  }, []);

  useEffect(() => {
    preloadSounds();
    initMuted(session?.role !== 'teacher');
  }, [session?.role]);

  useEffect(() => setSecretBid(null), [room?.lot?.spinStartAt, room?.lot?.round]);

  const banner = !connected && <div className="conn-banner">Reconectando ao servidor…</div>;

  if (session?.role === 'teacher' && room?.code === session.code)
    return (
      <>
        <SvgDefs />
        {banner}
        <TeacherRoom room={room} onLeave={() => update(null)} />
      </>
    );
  if (session?.role === 'player' && room?.code === session.code)
    return (
      <>
        <SvgDefs />
        {banner}
        <StudentRoom room={room} meId={session.playerId} secretBid={secretBid} setSecretBid={setSecretBid} />
      </>
    );
  if (session)
    return (
      <div className="center-screen">
        <SvgDefs />
        <div className="loader" aria-hidden="true" />
        <p>{connected ? 'Entrando na sala…' : 'Acordando o servidor… (pode levar até 1 minuto)'}</p>
        <button className="btn btn-ghost" onClick={() => update(null)}>Cancelar</button>
      </div>
    );
  return (
    <>
      <SvgDefs />
      <Home notice={notice} connected={connected} onSession={(s) => (setNotice(''), update(s))} />
    </>
  );
}

function Home({ notice, connected, onSession }: { notice: string; connected: boolean; onSession: (s: Session) => void }) {
  const params = new URLSearchParams(location.search);
  const [mode, setMode] = useState<'home' | 'teacher' | 'student'>(params.get('sala') ? 'student' : 'home');
  const [balance, setBalance] = useState(3000);
  const [minutes, setMinutes] = useState(30);
  const [code, setCode] = useState((params.get('sala') ?? '').toUpperCase());
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Render gratuito "dorme": já cutuca o servidor enquanto a pessoa lê a tela.
  useEffect(() => void fetch(`${SERVER_URL}/health`).catch(() => {}), []);

  const create = async () => {
    setBusy(true);
    const r = await send('teacher:create', { startingBalance: balance, matchMinutes: minutes });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    onSession({ role: 'teacher', code: r.code, token: r.token });
  };
  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await send('player:join', { code: code.trim().toUpperCase(), name });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    onSession({ role: 'player', code: code.trim().toUpperCase(), token: r.token, playerId: r.playerId });
  };

  return (
    <div className="home">
      <div className="mesh" aria-hidden="true">
        <i /><i /><i />
      </div>
      <header className="home-top">
        <Logo />
        <span className={`pill ${connected ? 'pill-ok' : ''}`}>{connected ? '● servidor online' : '○ acordando o servidor…'}</span>
      </header>
      <main className="home-main">
        <section className="hero">
          <p className="eyebrow">Empreendedorismo no atendimento</p>
          <h1>
            Monte o PC mais <span className="grad">funcional</span> com o seu saldo.
          </h1>
          <p className="lead">
            A roleta sorteia uma peça, a turma dá lances em tempo real e no final a TV mostra quem montou o computador que realmente funciona. Cada real conta!
          </p>
          <div className="orbit" aria-hidden="true">
            {SHOWCASE.map((id, k) => (
              <span key={id} style={{ '--k': k } as CSSProperties}>
                <ItemImg id={id} thumb size={96} />
              </span>
            ))}
          </div>
        </section>
        <section className="panel-card">
          {notice && <p className="notice">{notice}</p>}
          {mode === 'home' && (
            <div className="choose">
              <button className="choice" onClick={() => setMode('student')}>
                <span className="choice-ico">🎓</span>
                <strong>Sou aluno</strong>
                <small>Entrar com o código da sala</small>
              </button>
              <button className="choice alt" onClick={() => setMode('teacher')}>
                <span className="choice-ico">🧑‍🏫</span>
                <strong>Sou professor</strong>
                <small>Criar a sala e passar na TV</small>
              </button>
            </div>
          )}
          {mode === 'teacher' && (
            <div className="form">
              <h2>Criar sala</h2>
              <fieldset>
                <legend>Saldo de cada aluno</legend>
                <div className="seg">
                  {[2000, 3000, 4000, 5000].map((v) => (
                    <button key={v} className={v === balance ? 'on' : ''} onClick={() => setBalance(v)} aria-pressed={v === balance}>{brl(v)}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>Tempo da partida</legend>
                <div className="seg">
                  {[15, 20, 30, 45, 60].map((v) => (
                    <button key={v} className={v === minutes ? 'on' : ''} onClick={() => setMinutes(v)} aria-pressed={v === minutes}>{v} min</button>
                  ))}
                </div>
              </fieldset>
              <ul className="rules">
                <li>🎰 A roleta gira 7 s e sorteia uma peça com lance inicial.</li>
                <li>⏱ 1 minuto de lances. Ganha o maior lance.</li>
                <li>🔒 Algumas peças são de lance secreto: um lance só, às cegas.</li>
                <li>🏁 Acaba no fim do tempo, sem itens ou sem saldo.</li>
              </ul>
              {error && <p className="err" role="alert">{error}</p>}
              <div className="row">
                <button className="btn btn-ghost" onClick={() => setMode('home')}>Voltar</button>
                <button className="btn btn-primary" onClick={create} disabled={busy || !connected}>{busy ? 'Criando…' : 'Criar sala'}</button>
              </div>
            </div>
          )}
          {mode === 'student' && (
            <form className="form" onSubmit={join}>
              <h2>Entrar na sala</h2>
              <label>
                <span>Código da sala</span>
                <input className="code-input" value={code} maxLength={4} autoCapitalize="characters" autoComplete="off" placeholder="ABCD" onChange={(e) => setCode(e.target.value.toUpperCase())} required />
              </label>
              <label>
                <span>Seu nome</span>
                <input value={name} maxLength={18} autoComplete="given-name" placeholder="Como a turma te chama" onChange={(e) => setName(e.target.value)} required />
              </label>
              {error && <p className="err" role="alert">{error}</p>}
              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={() => setMode('home')}>Voltar</button>
                <button className="btn btn-primary" disabled={busy || !connected || code.length !== 4 || name.trim().length < 2}>{busy ? 'Entrando…' : 'Entrar'}</button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function TopBar({ room, children }: { room: PublicRoom; children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <Logo small />
      <span className="pill">Sala <b>{room.code}</b></span>
      {room.phase !== 'lobby' && room.phase !== 'finished' && (
        <>
          <MatchClock endsAt={room.matchEndsAt} />
          <span className="pill">🎰 {room.wheel.length} na roleta</span>
        </>
      )}
      <div className="topbar-end">{children}</div>
    </header>
  );
}

function TeacherRoom({ room, onLeave }: { room: PublicRoom; onLeave: () => void }) {
  const [error, setError] = useState('');
  const act = async (action: 'start' | 'pause' | 'resume' | 'close' | 'end' | 'reveal' | 'kick', playerId?: string) => {
    const r = await send('teacher:action', { action, playerId });
    setError(r.ok ? '' : r.error);
  };
  // Mantém o Render acordado durante a aula (ele dorme sem requisições HTTP).
  useEffect(() => {
    const id = setInterval(() => void fetch(`${SERVER_URL}/health`).catch(() => {}), 4 * 60_000);
    return () => clearInterval(id);
  }, []);
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});

  if (room.phase === 'finished')
    return (
      <div className="app tv">
        <FinalShow room={room} onReveal={() => act('reveal')} onNew={onLeave} />
      </div>
    );

  return (
    <div className="app tv">
      <TopBar room={room}>
        {room.phase !== 'lobby' && (
          <>
            {room.phase === 'bidding' && <button className="btn btn-sm" onClick={() => act('close')}>Encerrar lances</button>}
            <button className="btn btn-sm" onClick={() => act(room.paused ? 'resume' : 'pause')} title="Pausa só o próximo giro da roleta">
              {room.paused ? '▶ Continuar' : '⏸ Pausar roleta'}
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => confirm('Encerrar a partida e ir para o resultado?') && act('end')}>Encerrar partida</button>
          </>
        )}
        <SoundToggle />
        <button className="icon-btn" onClick={fullscreen} title="Tela cheia">⛶</button>
      </TopBar>
      {error && <p className="toast" role="alert" onClick={() => setError('')}>{error}</p>}
      {room.paused && room.phase === 'result' && <p className="toast info">Roleta pausada. Clique em Continuar para sortear o próximo item.</p>}
      {room.phase === 'lobby' ? (
        <main className="lobby">
          <div className="lobby-code">
            <p>Entre em <b>{JOIN_URL.replace(/^https?:\/\//, '')}</b> e digite o código</p>
            <div className="code" aria-label={`Código ${room.code}`}>
              {room.code.split('').map((ch, k) => (
                <span key={k} style={{ animationDelay: `${k * 0.12}s` }}>{ch}</span>
              ))}
            </div>
            <p className="muted">
              Cada aluno começa com <b>{brl(room.startingBalance)}</b> · partida de <b>{room.matchMinutes} min</b>
            </p>
          </div>
          <div className="lobby-players">
            <h2>{room.players.length} {room.players.length === 1 ? 'aluno entrou' : 'alunos entraram'}</h2>
            <ul>
              {room.players.map((p) => (
                <li key={p.id} style={{ '--c': p.color } as CSSProperties}>
                  <Avatar color={p.color} size={40} />
                  <span>{p.name}</span>
                  <button className="kick" onClick={() => confirm(`Remover ${p.name} da sala?`) && act('kick', p.id)} aria-label={`Remover ${p.name}`}>✕</button>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary btn-xl" disabled={!room.players.length} onClick={() => act('start')}>
              Começar o leilão 🔨
            </button>
          </div>
        </main>
      ) : (
        <main className="game">
          <Stage room={room} />
        </main>
      )}
    </div>
  );
}

function StudentRoom({ room, meId, secretBid, setSecretBid }: { room: PublicRoom; meId: string; secretBid: number | null; setSecretBid: (v: number | null) => void }) {
  const me = room.players.find((p) => p.id === meId);
  return (
    <div className="app student">
      <TopBar room={room}>
        {me && (
          <span className="pill me-pill" style={{ '--c': me.color } as CSSProperties}>
            <Avatar color={me.color} size={22} /> {me.name} · <b>{brl(me.balance)}</b>
          </span>
        )}
        <SoundToggle />
      </TopBar>
      {room.phase === 'lobby' ? (
        <main className="st-lobby">
          {me && <Avatar color={me.color} size={120} />}
          <h1>Você entrou, {me?.name}!</h1>
          <p>Aguarde o professor começar. Você tem <b>{brl(room.startingBalance)}</b> para montar o computador mais funcional da turma.</p>
          <div className="others">
            {room.players.map((p) => (
              <span key={p.id} title={p.name}><Avatar color={p.color} size={34} /></span>
            ))}
          </div>
        </main>
      ) : room.phase === 'finished' ? (
        <main className="game">
          <StudentFinal room={room} meId={meId} />
        </main>
      ) : (
        <main className="game">
          <Stage room={room} meId={meId} secretBid={secretBid} setSecretBid={setSecretBid} />
        </main>
      )}
    </div>
  );
}
