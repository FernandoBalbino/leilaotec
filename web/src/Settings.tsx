import { useState } from 'react';
import { brl } from '../../shared/catalog.ts';
import type { GameMode, MatchSettings } from '../../shared/protocol.ts';

const MODES: { id: GameMode; icon: string; title: string; text: string }[] = [
  { id: 'classic', icon: '🖥️', title: 'Clássico', text: 'Vence quem montar o computador mais funcional.' },
  { id: 'mission', icon: '🎯', title: 'Missão do cliente', text: 'Cada aluno recebe um cliente secreto e monta o PC ideal para ele.' },
];

// Configuração da partida: usada ao criar a sala e na "Nova partida" da mesma sala.
export function SettingsForm({ initial, submitLabel, busy, error, onSubmit, onCancel, children }: {
  initial?: Partial<MatchSettings>;
  submitLabel: string;
  busy?: boolean;
  error?: string;
  onSubmit: (s: MatchSettings) => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}) {
  const [mode, setMode] = useState<GameMode>(initial?.mode ?? 'classic');
  const [balance, setBalance] = useState(initial?.startingBalance ?? 3000);
  const [minutes, setMinutes] = useState(initial?.matchMinutes ?? 30);
  return (
    <div className="form">
      <fieldset>
        <legend>Modo de jogo</legend>
        <div className="modes">
          {MODES.map((m) => (
            <button key={m.id} className={`mode ${m.id === mode ? 'on' : ''}`} onClick={() => setMode(m.id)} aria-pressed={m.id === mode}>
              <span className="mode-ico">{m.icon}</span>
              <strong>{m.title}</strong>
              <small>{m.text}</small>
            </button>
          ))}
        </div>
      </fieldset>
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
      {children}
      {error && <p className="err" role="alert">{error}</p>}
      <div className="row">
        {onCancel && <button className="btn btn-ghost" onClick={onCancel}>Voltar</button>}
        <button className="btn btn-primary" disabled={busy} onClick={() => onSubmit({ startingBalance: balance, matchMinutes: minutes, mode })}>
          {busy ? 'Aguarde…' : submitLabel}
        </button>
      </div>
    </div>
  );
}
