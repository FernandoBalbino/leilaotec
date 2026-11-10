import React, { createContext, useContext } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { AbsoluteFill, Easing, Img, Sequence, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { loadFont as loadSora } from '@remotion/google-fonts/Sora';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

// Mesmas cores, fontes, peças e sons do jogo, para o vídeo parecer o próprio LeilãoTEC.
export const DISPLAY = loadSora('normal', { weights: ['600', '700', '800'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const FONT = loadInter('normal', { weights: ['500', '600', '700'], subsets: ['latin', 'latin-ext'] }).fontFamily;
export const C = {
  bg: '#070915', bg2: '#0c1030', card: '#141838', card2: '#1b1f4a', panel: 'rgba(255,255,255,0.06)', panel2: 'rgba(255,255,255,0.1)', line: 'rgba(255,255,255,0.12)',
  text: '#eef0ff', soft: '#cfd5f5', muted: '#9aa3c7', accent: '#7c5cff', accent2: '#22d3ee', gold: '#ffc940', secret: '#e051ff',
  danger: '#ff4d6d', ok: '#2ee6a6', warn: '#ffb020', orange: '#f97316',
};
export const GRAD = `linear-gradient(90deg, ${C.accent2}, ${C.accent} 50%, ${C.secret})`;
export const PLAYERS = { Ana: '#22d3ee', Bruno: '#f97316', Carla: '#e051ff', Davi: '#2ee6a6' } as const;
export type Who = keyof typeof PLAYERS;

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const ease = (f: number, i: number[], o: number[], e = OUT) => interpolate(f, i, o, { ...clamp, easing: e });
export const lerp = (p: number, a: number, b: number) => a + (b - a) * p;
export const brl = (n: number) => `R$ ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

// ---------- marcas da narração (em quadros, relativas à cena) ----------
type Cues = { cues: Record<string, number>; dur: number };
export const CueCtx = createContext<Cues>({ cues: {}, dur: 0 });
export function useCue() {
  const { cues, dur } = useContext(CueCtx);
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const at = (name: string, delay = 0) => (cues[name] ?? 0) + delay * fps;
  const p = (name: string, len = 0.5, delay = 0) => ease(frame, [at(name, delay), at(name, delay) + len * fps], [0, 1]);
  const pop = (name: string, delay = 0, damping = 12) => spring({ frame: frame - at(name, delay), fps, config: { damping, stiffness: 170, mass: 0.8 } });
  const after = (name: string, delay = 0) => frame >= at(name, delay);
  return { frame, fps, dur, at, p, pop, after };
}

// ---------- sons: biblioteca do Remotion (sfx/*.wav) e sons do próprio jogo (sounds/*.mp3) ----------
type SfxName = 'whoosh' | 'mouse-click' | 'ding' | 'switch' | 'roleta' | 'item' | 'lance' | 'contagem';
const SFX_FILE = (s: SfxName) => (['roleta', 'item', 'lance', 'contagem'].includes(s) ? `sounds/${s}.mp3` : `sfx/${s}.wav`);
export const Sfx = ({ at, src, volume = 0.5, len = 90 }: { at: number; src: SfxName; volume?: number; len?: number }) => (
  <Sequence from={Math.round(at)} durationInFrames={len} layout="none"><Audio src={staticFile(SFX_FILE(src))} volume={volume} /></Sequence>
);

// ---------- fundo: manchas desfocadas como na tela inicial do jogo ----------
export function Bg({ tint = C.accent }: { tint?: string }) {
  const f = useCurrentFrame();
  const blob = (c: string, x: number, y: number, s: number, k: number, o = 0.42) => (
    <div style={{ position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: '50%', background: c, opacity: o, filter: 'blur(110px)',
      translate: `${Math.sin((f + k * 40) / 80) * 70}px ${Math.cos((f + k * 30) / 90) * 50}px` }} />
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(1400px 800px at 80% -10%, #1b1660 0%, transparent 60%), ${C.bg}`, overflow: 'hidden' }}>
      {blob(tint, -260, -320, 900, 0)}{blob('#0fb5d8', 1300, 560, 900, 1, 0.3)}{blob('#c026d3', 760, 380, 520, 2, 0.18)}
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.08) 1.4px, transparent 1.6px)', backgroundSize: '38px 38px' }} />
    </AbsoluteFill>
  );
}

export const Center = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text, ...style }}>{children}</AbsoluteFill>
);

export const Title = ({ children, size = 92, style }: { children: ReactNode; size?: number; style?: CSSProperties }) => (
  <div style={{ font: `800 ${size}px/1.04 ${DISPLAY}`, letterSpacing: '-0.035em', color: C.text, textAlign: 'center', ...style }}>{children}</div>
);

export const Grad = ({ children }: { children: ReactNode }) => (
  <span style={{ background: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{children}</span>
);

export const Panel = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ borderRadius: 32, padding: 36, background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))', border: `2px solid ${C.line}`,
    boxShadow: '0 40px 100px -40px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,255,255,.08)', fontFamily: FONT, color: C.text, ...style }}>{children}</div>
);

export function Chip({ children, bg = C.panel2, fg = C.text, size = 30, style }: { children: ReactNode; bg?: string; fg?: string; size?: number; style?: CSSProperties }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35, padding: `${size * 0.32}px ${size * 0.7}px`, borderRadius: 999, background: bg, color: fg, font: `700 ${size}px ${FONT}`, whiteSpace: 'nowrap', ...style }}>{children}</span>;
}

// ---------- peças, avatares e marca ----------
export const Item = ({ id, size = 200, style }: { id: string; size?: number; style?: CSSProperties }) => (
  <Img src={staticFile(`items/${id}.webp`)} style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,.5))', ...style }} />
);

export function Avatar({ who, size = 64, style }: { who: Who; size?: number; style?: CSSProperties }) {
  const c = PLAYERS[who];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ flexShrink: 0, borderRadius: '50%', boxShadow: `0 0 0 ${size / 22}px rgba(255,255,255,.14), 0 10px 26px -8px ${c}`, ...style }}>
      <defs>
        <radialGradient id={`sh-${who}`} cx="30%" cy="25%" r="80%"><stop offset="0" stopColor="#fff" stopOpacity=".35" /><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".35" /></radialGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill={c} /><circle cx="32" cy="32" r="32" fill={`url(#sh-${who})`} />
      <circle cx="32" cy="25" r="11" fill="#fff" fillOpacity=".92" /><path d="M12 56c2-11 10-17 20-17s18 6 20 17a32 32 0 0 1-40 0z" fill="#fff" fillOpacity=".92" />
    </svg>
  );
}

export function Logo({ size = 64, p = 1 }: { size?: number; p?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.4, font: `700 ${size}px ${DISPLAY}`, color: C.text, letterSpacing: '-0.02em' }}>
      <svg viewBox="0 0 32 32" width={size * 1.5} height={size * 1.5} style={{ scale: ease(p, [0, 0.6], [0, 1], Easing.back(2)), rotate: `${ease(p, [0, 0.6], [-90, 0])}deg`, filter: 'drop-shadow(0 8px 24px rgba(124,92,255,.6))' }}>
        <defs><linearGradient id="lg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#22d3ee" /><stop offset="1" stopColor="#7c5cff" /></linearGradient></defs>
        <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#lg)" />
        <path d="M10 21l7-7m-4-3l6 6m-1-9l5 5-3 3-5-5zM8 24h9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span style={{ opacity: ease(p, [0.3, 0.8], [0, 1]), translate: `${ease(p, [0.3, 0.8], [-30, 0])}px 0` }}>Leilão<b style={{ background: 'linear-gradient(90deg, #22d3ee, #7c5cff)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>TEC</b></span>
    </div>
  );
}

/** martelo do leiloeiro: p 0→1 desce e bate */
export function Gavel({ p, size = 300, style }: { p: number; size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible', rotate: `${ease(p, [0, 1], [-55, 0], Easing.in(Easing.cubic))}deg`, transformOrigin: '85% 85%', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.6))', ...style }}>
      <rect x="44" y="40" width="12" height="62" rx="5" fill="#b9773b" transform="rotate(-45 50 70)" />
      <g transform="rotate(-45 50 40)"><rect x="22" y="24" width="56" height="30" rx="9" fill="#d18a45" /><rect x="22" y="24" width="10" height="30" rx="4" fill={C.gold} /><rect x="68" y="24" width="10" height="30" rx="4" fill={C.gold} /></g>
    </svg>
  );
}

/** carimbo "VENDIDO!" */
export function Stamp({ p, text = 'VENDIDO!', color = C.ok, size = 120, style }: { p: number; text?: string; color?: string; size?: number; style?: CSSProperties }) {
  if (p <= 0) return null;
  return (
    <div style={{ font: `800 ${size}px ${DISPLAY}`, letterSpacing: '0.04em', color, border: `${size / 14}px solid currentColor`, borderRadius: size / 5, padding: `0 ${size / 3}px`,
      rotate: '-7deg', scale: ease(p, [0, 1], [2.6, 1], Easing.bezier(0.2, 1.6, 0.4, 1)), opacity: ease(p, [0, 0.3], [0, 1]), textShadow: `0 0 40px ${color}88`, whiteSpace: 'nowrap', ...style }}>{text}</div>
  );
}

/** barra "Computador funcional", vermelha → verde */
export function Meter({ percent, label = 'Computador funcional', width = 1100, style }: { percent: number; label?: string; width?: number; style?: CSSProperties }) {
  return (
    <div style={{ width, display: 'grid', gap: 14, fontFamily: DISPLAY, color: C.text, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ font: `700 40px ${DISPLAY}` }}>{label}</span>
        <strong style={{ font: `800 84px/1 ${DISPLAY}` }}>{Math.round(percent)}%</strong>
      </div>
      <div style={{ height: 56, borderRadius: 999, background: 'rgba(255,255,255,.08)', border: `2px solid ${C.line}`, padding: 6 }}>
        <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #ff3b5c, #ff7a1a 40%, #ffc940 62%, #2ee6a6 88%)', backgroundSize: `${width - 16}px 100%`, width: `${percent}%` }} />
      </div>
    </div>
  );
}

/** ponteiro do mouse que anda entre pontos e clica (com som e onda) */
export type Key = [frame: number, x: number, y: number];
export function Cursor({ path: raw, clicks = [] }: { path: Key[]; clicks?: number[] }) {
  const f = useCurrentFrame();
  const path = [...raw].sort((a, b) => a[0] - b[0]).map((k, i, arr) => [Math.max(k[0], (arr[i - 1]?.[0] ?? -Infinity) + 1), k[1], k[2]] as Key);
  for (let i = 1; i < path.length; i++) if (path[i][0] <= path[i - 1][0]) path[i][0] = path[i - 1][0] + 1;
  if (!path.length || f < path[0][0]) return null;
  const fr = path.map((k) => k[0]);
  const e = { ...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1) };
  const x = fr.length > 1 ? interpolate(f, fr, path.map((k) => k[1]), e) : path[0][1];
  const y = fr.length > 1 ? interpolate(f, fr, path.map((k) => k[2]), e) : path[0][2];
  const c = clicks.map((k) => f - k).find((d) => d >= 0 && d < 14);
  return (
    <div style={{ position: 'absolute', left: x, top: y, zIndex: 60, pointerEvents: 'none' }}>
      {clicks.map((k) => <Sfx key={k} at={k} src="mouse-click" volume={0.7} />)}
      {c !== undefined && <div style={{ position: 'absolute', left: -38, top: -38, width: 76, height: 76, borderRadius: '50%', border: `5px solid ${C.accent2}`, opacity: 1 - c / 14, scale: 0.3 + c / 10 }} />}
      <svg width="58" height="58" viewBox="0 0 24 24" style={{ scale: c !== undefined && c < 5 ? 0.85 : 1, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.6))' }}>
        <path d="M4 2l15 9.5-6.6 1.4L16 21l-3 1.3-3.6-8L4 18z" fill="#fff" stroke={C.bg} strokeWidth="1.2" />
      </svg>
    </div>
  );
}

/** explosão de partículas guiada pelo quadro */
export function Burst({ p, color = C.gold, n = 16, r = 260, x = 0, y = 0 }: { p: number; color?: string; n?: number; r?: number; x?: number; y?: number }) {
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 40 }}>
      <div style={{ position: 'absolute', width: r * 2 * p, height: r * 2 * p, left: -r * p, top: -r * p, borderRadius: '50%', border: `${10 * (1 - p)}px solid ${color}`, opacity: 1 - p }} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2, d = r * (0.3 + 0.9 * p);
        return <div key={i} style={{ position: 'absolute', width: 18 * (1 - p) + 6, height: 18 * (1 - p) + 6, borderRadius: '50%', background: i % 2 ? color : C.accent2, left: Math.cos(a) * d, top: Math.sin(a) * d, opacity: 1 - p }} />;
      })}
    </div>
  );
}

/** texto ("-R$ 510", "+8") que sobe e some */
export function Points({ p, text, color = C.gold, x, y, size = 80 }: { p: number; text: string; color?: string; x: number; y: number; size?: number }) {
  if (p <= 0 || p >= 1) return null;
  return <div style={{ position: 'absolute', left: x, top: y - p * 120, translate: '-50% -50%', scale: ease(p, [0, 0.15], [0.4, 1]), font: `800 ${size}px ${DISPLAY}`, color, opacity: ease(p, [0.7, 1], [1, 0]), zIndex: 45, whiteSpace: 'nowrap', textShadow: '0 6px 20px rgba(0,0,0,.6)' }}>{text}</div>;
}

/** confete guiado pelo quadro */
export function Confetti({ at, n = 140, x0 = 960, y0 = 320 }: { at: number; n?: number; x0?: number; y0?: number }) {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 160) return null;
  const cols = [...Object.values(PLAYERS), C.gold, C.accent];
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 70 }}>
      {Array.from({ length: n }, (_, i) => {
        const vx = (random(`vx${i}`) - 0.5) * 36, vy = -random(`vy${i}`) * 34 - 10;
        return <div key={i} style={{ position: 'absolute', left: x0 + vx * f, top: y0 + vy * f + 0.7 * f * f, width: 18, height: 10, background: cols[i % cols.length], rotate: `${f * (random(`r${i}`) * 20 - 10)}deg`, opacity: ease(f, [120, 160], [1, 0]) }} />;
      })}
    </AbsoluteFill>
  );
}

/** cadeado (traço do Lucide, ISC) */
export const Lock = ({ size = 40, color = 'currentColor', open = 0 }: { size?: number; color?: string; open?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d={open ? 'M7 11V7a5 5 0 0 1 9.9-1' : 'M7 11V7a5 5 0 0 1 10 0v4'} />
  </svg>
);

/** balão de lance que sai de um jogador */
export function Bubble({ p, text, color, style }: { p: number; text: string; color: string; style?: CSSProperties }) {
  if (p <= 0) return null;
  return (
    <div style={{ position: 'absolute', padding: '14px 30px', borderRadius: 26, background: color, color: '#061018', font: `800 56px ${DISPLAY}`, whiteSpace: 'nowrap', boxShadow: `0 20px 50px -14px ${color}`,
      scale: ease(p, [0, 1], [0.3, 1], Easing.back(2.2)), opacity: ease(p, [0, 0.3], [0, 1]), ...style }}>{text}</div>
  );
}

export { React };
