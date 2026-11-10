import { AbsoluteFill, Easing } from 'remotion';
import { Bg, C, Chip, DISPLAY, FONT, Item, Sfx, brl, ease, useCue } from '../kit';

// Roleta gigante como a do jogo: só a metade de cima aparece; para no processador.
const SLICES = ['cpu-r5', 'mon-24', 'cadeira', 'ram-16', 'headset', 'gpu-gamer', 'psu-600', 'webcam', 'ssd-480', 'mb-media', 'roteador', 'kb-simples'];
const COLORS = ['#2a1f7a', '#123a5c', '#3d1858', '#1b2a6b'];
const R = 880, CX = 960, CY = 1230;
const slicePath = (k: number, n: number) => {
  const a0 = (k / n) * Math.PI * 2 - Math.PI / 2, a1 = ((k + 1) / n) * Math.PI * 2 - Math.PI / 2;
  return `M0 0 L${Math.cos(a0) * R} ${Math.sin(a0) * R} A${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R}Z`;
};

const GUESSES: [string, string, string][] = [['cpu', 'Processador?', C.accent2], ['ram', 'Memória?', C.accent2], ['mon', 'Monitor?', C.accent2], ['chair', 'Cadeira gamer?! 😂', C.gold]];

export const S3 = () => {
  const { frame, at, p, pop } = useCue();
  const n = SLICES.length, step = 360 / n;
  const spinAt = at('spin'), bigAt = at('big');
  // gira rápido e desacelera até parar com a fatia 0 (processador) no ponteiro
  const turn = frame < spinAt ? frame * 0.2 : ease(frame, [spinAt, bigAt - 6], [spinAt * 0.2, 360 * 5 + step / 2], Easing.out(Easing.cubic));
  const big = p('big', 0.6);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text, overflow: 'hidden' }}>
      <Bg />
      <Sfx at={spinAt} src="roleta" volume={0.6} len={Math.max(30, Math.round(bigAt - spinAt))} />
      <Sfx at={bigAt} src="item" volume={0.8} />
      {/* brilho atrás da roleta */}
      <div style={{ position: 'absolute', left: CX - R - 80, top: CY - R - 80, width: (R + 80) * 2, height: (R + 80) * 2, borderRadius: '50%', background: 'conic-gradient(#7c5cff, #22d3ee, #e051ff, #ffc940, #7c5cff)', filter: 'blur(60px)', opacity: 0.35, rotate: `${frame * 1.5}deg` }} />
      <div style={{ position: 'absolute', left: CX, top: CY, rotate: `${-turn}deg` }}>
        <svg width={R * 2} height={R * 2} viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} style={{ position: 'absolute', left: -R, top: -R, overflow: 'visible' }}>
          {SLICES.map((_, k) => <path key={k} d={slicePath(k, n)} fill={COLORS[k % COLORS.length]} stroke="rgba(255,255,255,.18)" strokeWidth="4" />)}
          <circle r={R} fill="none" stroke={C.gold} strokeWidth="16" />
          {Array.from({ length: 36 }, (_, k) => <circle key={k} cx={Math.cos((k / 36) * Math.PI * 2) * (R - 2)} cy={Math.sin((k / 36) * Math.PI * 2) * (R - 2)} r="9" fill={(k + Math.floor(frame / 4)) % 2 ? '#ffe9a8' : '#5d4b1a'} />)}
          <circle r="190" fill="#0c1030" stroke={C.gold} strokeWidth="10" />
        </svg>
        {SLICES.map((id, k) => {
          const a = (k + 0.5) * step;
          return (
            <div key={id} style={{ position: 'absolute', left: 0, top: 0, rotate: `${a}deg` }}>
              <div style={{ position: 'absolute', left: -85, top: -R + 70, rotate: '0deg' }}><Item id={id} size={170} /></div>
            </div>
          );
        })}
      </div>
      {/* ponteiro */}
      <svg width="90" height="110" viewBox="0 0 90 110" style={{ position: 'absolute', left: CX - 45, top: CY - R - 70, filter: 'drop-shadow(0 8px 12px rgba(0,0,0,.6))' }}>
        <path d="M45 108 L6 10 Q45 -4 84 10 Z" fill={C.gold} stroke="#fff" strokeWidth="5" />
      </svg>
      <div style={{ position: 'absolute', top: 60, width: '100%', display: 'flex', justifyContent: 'center', gap: 26, opacity: 1 - big }}>
        {GUESSES.map(([cue, text, color]) => (
          <div key={cue} style={{ scale: pop(cue), opacity: p(cue, 0.2) }}>
            <Chip size={42} bg="rgba(12,16,48,.85)" fg={color} style={{ border: `2px solid ${color}55` }}>{text}</Chip>
          </div>
        ))}
      </div>
      {/* a peça sorteada fica grande no centro */}
      <AbsoluteFill style={{ opacity: big, background: 'radial-gradient(circle at 50% 46%, rgba(124,92,255,.45), rgba(7,9,21,.94) 58%)' }}>
        <div style={{ position: 'absolute', left: 960, top: 500, width: 2600, height: 2600, marginLeft: -1300, marginTop: -1300, rotate: `${frame * 0.4}deg`,
          background: 'repeating-conic-gradient(rgba(255,255,255,.07) 0 8deg, transparent 8deg 20deg)' }} />
        <div style={{ position: 'absolute', left: 960, top: 470, translate: '-50% -50%', scale: ease(frame, [bigAt, bigAt + 18], [0.2, 1], Easing.back(1.6)) }}>
          <Item id="cpu-r5" size={520} />
          <div style={{ position: 'absolute', right: -40, bottom: 40, rotate: '-5deg', scale: pop('start'), font: `800 52px ${DISPLAY}`, color: '#2a1a00', background: C.gold, padding: '10px 26px', borderRadius: 18, boxShadow: '0 14px 40px -10px rgba(255,201,64,.9)', whiteSpace: 'nowrap' }}>
            {brl(450)}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 780, width: '100%', textAlign: 'center', opacity: p('big', 0.5, 0.3) }}>
          <div style={{ font: `800 80px ${DISPLAY}` }}>Processador Ryzen 5</div>
          <div style={{ font: `600 40px ${FONT}`, color: C.soft, marginTop: 14, opacity: p('start') }}>Lance inicial: <b style={{ color: C.gold }}>{brl(450)}</b></div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
