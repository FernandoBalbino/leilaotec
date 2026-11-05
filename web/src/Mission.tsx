import { useState } from 'react';
import type { Mission } from '../../shared/missions.ts';

// Cartão da missão secreta. "big" na sala de espera; compacto (com "ver história") durante o jogo.
export function MissionCard({ mission, big, reveal }: { mission: Mission; big?: boolean; reveal?: boolean }) {
  const [open, setOpen] = useState(false);
  const full = big || open;
  return (
    <section className={`mission ${big ? 'mission-big' : ''} ${reveal ? 'mission-reveal' : ''}`} aria-label="Missão do cliente">
      <span className="mission-emoji" aria-hidden="true">{mission.emoji}</span>
      <div className="mission-text">
        {!reveal && <p className="mission-tag">🤫 Sua missão secreta</p>}
        <h2>{mission.title}</h2>
        <p className="mission-client">Cliente: <b>{mission.client}</b></p>
        {(full || reveal) && <p className="mission-story">{mission.story}</p>}
        {!reveal && <p className="mission-hint">💡 {mission.hint}</p>}
        {big && <p className="mission-secret">Não conte para ninguém! No final, vence quem atender melhor o próprio cliente.</p>}
      </div>
      {!big && !reveal && (
        <button className="btn btn-sm btn-ghost mission-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? 'Esconder história' : 'Ver história'}
        </button>
      )}
    </section>
  );
}
