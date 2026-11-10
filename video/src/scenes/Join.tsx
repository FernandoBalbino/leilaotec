import { AbsoluteFill, Easing } from 'remotion';
import { Avatar, Bg, C, Chip, Cursor, DISPLAY, FONT, Logo, Sfx, brl, ease, lerp, useCue, type Who } from '../kit';

// Chromebook à esquerda (formulário "Entrar na sala"), TV à direita (código e alunos entrando).
const SCREEN = { x: 120, y: 150, w: 880, h: 600 };
const CODE = 'KQTB';
const URL = 'fernandobalbino.github.io/leilaotec';

export const S2 = () => {
  const { frame, at, p } = useCue();
  const typed = (text: string, from: number, every = 5) => text.slice(0, Math.max(0, Math.min(text.length, Math.floor((frame - from) / every) + 1)));
  const url = typed(URL, at('site'), 1);
  const code = typed(CODE, at('code'), 5);
  const name = typed('Ana', at('name', 0.3), 5);
  const joined = at('name', 1.4);
  const balance = p('balance', 0.9);
  const warnD = frame - at('warn');
  const slideIn = ease(frame, [0, 18], [60, 0]);
  const abs = (x: number, y: number) => [SCREEN.x + x, SCREEN.y + y] as const;
  const field = (top: number, h: number, focus: boolean) => ({
    position: 'absolute' as const, left: 100, top, width: 680, height: h, borderRadius: 16, background: 'rgba(0,0,0,.35)',
    border: `2px solid ${focus ? C.accent : C.line}`, boxShadow: focus ? '0 0 0 6px rgba(124,92,255,.25)' : 'none', display: 'grid', placeItems: 'center',
  });
  const arrivals: [Who, number][] = [['Ana', joined], ['Bruno', at('avatar')], ['Carla', at('avatar', 0.25)], ['Davi', at('avatar', 0.5)]];
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Bg />
      {/* Chromebook */}
      <div style={{ position: 'absolute', left: SCREEN.x - 22, top: SCREEN.y - 22, width: SCREEN.w + 44, height: SCREEN.h + 44, borderRadius: 30, background: '#1b1e30', border: '2px solid #2c3150', translate: `0 ${slideIn}px` }} />
      <div style={{ position: 'absolute', left: SCREEN.x - 90, top: SCREEN.y + SCREEN.h + 22, width: SCREEN.w + 180, height: 40, borderRadius: '0 0 30px 30px', background: 'linear-gradient(180deg, #2a2f4a, #171a2c)', translate: `0 ${slideIn}px` }} />
      <div style={{ position: 'absolute', left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, borderRadius: 14, overflow: 'hidden', translate: `0 ${slideIn}px`,
        background: 'radial-gradient(700px 400px at 90% 0%, #2a1f7a, transparent 70%), #0b0e24' }}>
        <div style={{ position: 'absolute', left: 30, top: 20, width: 820, height: 56, borderRadius: 999, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', padding: '0 26px', font: `500 26px ${FONT}`, color: C.soft }}>
          🔒&nbsp;&nbsp;{url}<span style={{ opacity: frame >= at('site') && url.length < URL.length ? 1 : 0 }}>|</span>
        </div>
        <div style={{ position: 'absolute', left: 100, top: 108, font: `800 46px ${DISPLAY}` }}>Entrar na sala</div>
        <div style={{ position: 'absolute', left: 100, top: 188, font: `600 22px ${FONT}`, color: C.muted }}>Código da sala</div>
        <div style={field(225, 90, frame >= at('code') - 2 && frame < at('name'))}>
          <span style={{ font: `800 58px ${DISPLAY}`, letterSpacing: '0.45em', marginRight: '-0.45em', color: code ? C.text : 'rgba(255,255,255,.2)' }}>{code || 'ABCD'}</span>
        </div>
        <div style={{ position: 'absolute', left: 100, top: 338, font: `600 22px ${FONT}`, color: C.muted }}>Seu nome</div>
        <div style={{ ...field(375, 70, frame >= at('name') && frame < joined), placeItems: 'center start', paddingLeft: 26 }}>
          <span style={{ font: `600 32px ${FONT}`, color: name ? C.text : 'rgba(255,255,255,.25)' }}>{name || 'Como a turma te chama'}</span>
        </div>
        <div style={{ position: 'absolute', left: 620, top: 475, width: 160, height: 66, borderRadius: 14, display: 'grid', placeItems: 'center', font: `700 28px ${FONT}`,
          background: 'linear-gradient(135deg, #7c5cff, #5a3df0 60%, #3b82f6)', boxShadow: '0 10px 30px -10px rgba(124,92,255,.8)', scale: frame >= joined - 2 && frame < joined + 4 ? 0.92 : 1 }}>Entrar</div>
        {/* depois de entrar: tela de espera do aluno */}
        <AbsoluteFill style={{ background: '#0b0e24', opacity: ease(frame, [joined + 4, joined + 12], [0, 1]), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22 }}>
          <div style={{ scale: ease(frame, [joined + 6, joined + 22], [0, 1], Easing.back(2)) }}><Avatar who="Ana" size={150} /></div>
          <div style={{ font: `800 50px ${DISPLAY}` }}>Você entrou, Ana!</div>
          <div style={{ font: `500 28px ${FONT}`, color: C.soft }}>Aguarde o professor começar.</div>
          <div style={{ opacity: balance, scale: ease(balance, [0, 0.3], [0.6, 1], Easing.back(2)), font: `800 44px ${DISPLAY}`, color: C.gold, padding: '10px 30px', borderRadius: 999, background: 'rgba(255,201,64,.12)', border: '2px solid rgba(255,201,64,.45)' }}>
            💰 {brl(Math.round(lerp(balance, 0, 3000) / 10) * 10)}
          </div>
        </AbsoluteFill>
      </div>
      {/* TV */}
      <div style={{ position: 'absolute', left: 1100, top: 180, width: 720, height: 450, borderRadius: 22, background: '#05060f', border: '14px solid #1b1e30', boxShadow: '0 40px 80px -30px rgba(0,0,0,.9)', overflow: 'hidden',
        scale: ease(frame, [4, 22], [0.85, 1], Easing.back(1.5)), opacity: ease(frame, [4, 14], [0, 1]) }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(500px 300px at 80% 0%, #1b1660, transparent 70%)' }} />
        <div style={{ position: 'absolute', left: 26, top: 20 }}><Logo size={26} /></div>
        <div style={{ position: 'absolute', top: 92, width: '100%', textAlign: 'center', font: `500 24px ${FONT}`, color: C.soft }}>Entre no site e digite o código</div>
        <div style={{ position: 'absolute', top: 140, width: '100%', display: 'flex', justifyContent: 'center', gap: 14 }}>
          {CODE.split('').map((ch, k) => (
            <span key={k} style={{ width: 96, height: 120, display: 'grid', placeItems: 'center', font: `800 86px ${DISPLAY}`, borderRadius: 18, background: 'rgba(255,255,255,.08)', border: `2px solid ${C.line}`,
              scale: ease(frame - at('code', -0.6) - k * 4, [0, 14], [0.4, 1], Easing.back(2.4)), boxShadow: frame >= at('code') + k * 5 ? `0 0 0 4px ${C.accent2}` : 'none' }}>{ch}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 28, width: '100%', display: 'flex', justifyContent: 'center', gap: 16 }}>
          {arrivals.map(([who, t]) => (
            <div key={who} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 8px', borderRadius: 999, background: 'rgba(255,255,255,.08)', border: `2px solid ${C.line}`,
              font: `600 24px ${FONT}`, scale: ease(frame, [t, t + 14], [0, 1], Easing.back(2.2)) }}>
              <Avatar who={who} size={44} />{who}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 1360, top: 630, width: 200, height: 70, background: 'linear-gradient(180deg, #1b1e30, #0d0f1c)', clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)', opacity: ease(frame, [4, 14], [0, 1]) }} />
      {arrivals.map(([who, t]) => <Sfx key={who} at={t} src="switch" volume={0.35} />)}
      <div style={{ position: 'absolute', left: 1460, top: 790, translate: '-50% 0', opacity: balance }}>
        <Chip size={34} bg="rgba(255,201,64,.14)" fg={C.gold}>Cada um ganha {brl(3000)} de saldo</Chip>
      </div>
      {/* aviso */}
      <div style={{ position: 'absolute', left: 960, top: 930, translate: `${warnD >= 0 && warnD < 16 ? Math.sin(warnD * 2.4) * (16 - warnD) * 1.6 : 0}px 0`, opacity: p('warn', 0.25) }}>
        <div style={{ translate: '-50% 0', scale: ease(p('warn', 0.4), [0, 1], [1.6, 1]) }}>
          <Chip size={46} bg={C.danger} fg="#fff" style={{ boxShadow: '0 20px 50px -14px rgba(255,77,109,.9)' }}>⚠️ Dinheiro gasto não volta!</Chip>
        </div>
      </div>
      <Sfx at={at('warn')} src="ding" volume={0.5} />
      {code.length > 0 && CODE.split('').map((_, k) => <Sfx key={k} at={at('code') + k * 5} src="mouse-click" volume={0.25} len={10} />)}
      <Cursor
        path={[
          [at('code', -0.8), 700, 300], [at('code', -0.1), ...abs(440, 270)], [at('name', 0.2), ...abs(440, 410)],
          [joined - 6, ...abs(700, 508)], [joined + 30, ...abs(780, 560)],
        ]}
        clicks={[Math.round(at('code', -0.1)), Math.round(at('name', 0.2)), Math.round(joined - 2)]}
      />
    </AbsoluteFill>
  );
};
