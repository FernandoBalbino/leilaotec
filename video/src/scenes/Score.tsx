import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { Avatar, Bg, C, Chip, DISPLAY, FONT, Item, Meter, Points, Sfx, Title, ease, useCue } from '../kit';

// Pontuação: as peças que fazem o PC ligar enchem a barra; repetida e acessório não somam.
const ROW1: [string, string][] = [['mb-media', 'Placa-mãe'], ['cpu-r5', 'Processador'], ['ram-16', 'Memória RAM'], ['ssd-480', 'HD ou SSD'], ['psu-600', 'Fonte'], ['mon-24', 'Monitor']];
const ROW2: [string, string][] = [['cooler-box', 'Cooler'], ['case-simples', 'Gabinete'], ['so-linux', 'Sistema'], ['gpu-gamer', 'Placa de vídeo'], ['kb-simples', 'Teclado'], ['mouse-simples', 'Mouse']];

function Slot({ id, name, on, x, y }: { id: string; name: string; on: number; x: number; y: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 170, height: 200, borderRadius: 22, display: 'grid', justifyItems: 'center', alignContent: 'center', gap: 6, fontFamily: FONT,
      background: on ? 'linear-gradient(180deg, rgba(46,230,166,.18), rgba(255,255,255,.03))' : 'rgba(255,255,255,.04)', border: `2px ${on ? 'solid' : 'dashed'} ${on ? 'rgba(46,230,166,.55)' : C.line}`,
      scale: ease(on, [0, 0.5, 1], [1, 1.12, 1]) }}>
      <Item id={id} size={110} style={{ opacity: 0.3 + on * 0.7, filter: on ? 'drop-shadow(0 10px 16px rgba(0,0,0,.5))' : 'grayscale(1)' }} />
      <span style={{ font: `600 20px ${FONT}`, color: on ? C.text : C.muted, textAlign: 'center', lineHeight: 1.1 }}>{name}</span>
    </div>
  );
}

function Side({ show, children }: { show: number; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 1260, top: 150, width: 580, height: 800, borderRadius: 36, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26, textAlign: 'center',
      background: 'linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))', border: `2px solid ${C.line}`, fontFamily: FONT, color: C.text,
      opacity: show, translate: `${(1 - show) * 60}px 0`, scale: ease(show, [0, 1], [0.94, 1]) }}>{children}</div>
  );
}

export const S6 = () => {
  const { frame, at, p, pop } = useCue();
  const lit1 = (k: number) => ease(frame, [at('main', 0.3) + k * 6, at('main', 0.3) + k * 6 + 10], [0, 1]);
  const lit2 = (k: number) => ease(frame, [at('main', 2) + k * 4, at('main', 2) + k * 4 + 8], [0, 1]);
  const percent = ROW1.reduce((a, _, k) => a + lit1(k) * 11, 0) + ROW2.reduce((a, _, k) => a + lit2(k) * (34 / 6), 0);
  const range = (a: string, b?: string) => ease(frame, [at(a), at(a) + 10], [0, 1]) * (b ? ease(frame, [at(b) - 8, at(b)], [1, 0]) : 1);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Bg />
      <div style={{ position: 'absolute', left: 90, top: 110, opacity: p('work', 0.4) }}><Meter percent={percent} width={1100} /></div>
      {ROW1.map(([id, name], k) => <Slot key={id} id={id} name={name} on={lit1(k)} x={90 + k * 186} y={330} />)}
      {ROW2.map(([id, name], k) => <Slot key={id} id={id} name={name} on={lit2(k)} x={90 + k * 186} y={560} />)}
      {ROW1.map((_, k) => <Sfx key={k} at={at('main', 0.3) + k * 6} src="mouse-click" volume={0.3} len={10} />)}
      <div style={{ position: 'absolute', left: 90, top: 800, width: 1100, display: 'flex', justifyContent: 'center', opacity: p('main', 0.4, 0.4) }}>
        <Chip size={36} bg="rgba(46,230,166,.14)" fg={C.ok}>⚡ As peças que fazem o PC ligar valem mais</Chip>
      </div>
      <Side show={range('repeat', 'acc')}>
        <Title size={56}>Peça repetida</Title>
        <div style={{ display: 'flex', gap: 30 }}>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
            <Item id="ram-16" size={180} /><Chip size={26} bg={p('best') ? 'rgba(46,230,166,.18)' : C.panel2} fg={p('best') ? C.ok : C.text}>{p('best') ? '✓ conta a melhor' : 'RAM 16GB'}</Chip>
          </div>
          <div style={{ display: 'grid', justifyItems: 'center', gap: 10, opacity: 1 - p('best') * 0.65, translate: `0 ${p('best') * 30}px`, scale: pop('repeat') }}>
            <Item id="ram-8" size={180} style={{ filter: p('best') ? 'grayscale(1)' : undefined }} /><Chip size={26} bg={p('best') ? 'rgba(255,77,109,.18)' : C.panel2} fg={p('best') ? '#ffb3c0' : C.text}>{p('best') ? 'não soma' : 'RAM 8GB'}</Chip>
          </div>
        </div>
      </Side>
      <Side show={range('acc', 'tie')}>
        <Title size={56}>Acessório</Title>
        <div style={{ position: 'relative' }}>
          <Item id="cadeira" size={300} style={{ scale: pop('acc') }} />
          <svg viewBox="0 0 100 100" width="300" height="300" style={{ position: 'absolute', inset: 0, opacity: p('chair', 0.2), scale: ease(p('chair', 0.4), [0, 1], [1.8, 1]) }}>
            <path d="M15 15 L85 85 M85 15 L15 85" stroke={C.danger} strokeWidth="11" strokeLinecap="round" />
          </svg>
        </div>
        <Chip size={34} bg="rgba(255,77,109,.16)" fg="#ffb3c0">0 pontos no modo clássico</Chip>
        <div style={{ font: `800 40px/1.2 ${DISPLAY}`, color: C.gold, opacity: p('chair', 0.3, 0.2) }}>Cadeira gamer não roda jogo! 😂</div>
      </Side>
      <Sfx at={at('chair')} src="whoosh" volume={0.5} />
      <Side show={range('tie')}>
        <Title size={56}>Empatou?</Title>
        {([['Ana', 340], ['Carla', 120]] as const).map(([who, left], k) => {
          const win = k === 0 && frame >= at('save');
          return (
            <div key={who} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 22, background: win ? 'linear-gradient(90deg, rgba(255,201,64,.3), rgba(255,201,64,.06))' : 'rgba(255,255,255,.06)', boxShadow: win ? `0 0 0 3px ${C.gold}` : 'none', scale: pop('tie', k * 0.15) }}>
              <Avatar who={who} size={70} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ font: `700 36px ${DISPLAY}` }}>{who} {win && '👑'}</div>
                <div style={{ font: `600 26px ${FONT}`, color: C.soft, opacity: p('save', 0.3) }}>sobrou <b style={{ color: win ? C.gold : C.text }}>R$ {left}</b></div>
              </div>
              <span style={{ font: `800 52px ${DISPLAY}` }}>90%</span>
            </div>
          );
        })}
        <div style={{ font: `700 34px ${DISPLAY}`, color: C.gold, opacity: p('save', 0.3, 0.3) }}>Ganha quem economizou mais</div>
      </Side>
      <Sfx at={at('save')} src="ding" volume={0.6} />
    </AbsoluteFill>
  );
};

// Modo missão: cliente secreto, o que não conta e o que vale ponto.
export const S7 = () => {
  const { frame, at, p, pop } = useCue();
  const card = pop('secret', 0, 14);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Bg tint="#b07b00" />
      <div style={{ position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center', scale: pop('mode'), opacity: p('mode', 0.2) }}>
        <Chip size={46} bg="rgba(255,201,64,.16)" fg={C.gold} style={{ border: '2px solid rgba(255,201,64,.5)' }}>🎯 Missão do cliente</Chip>
      </div>
      <Sfx at={at('mode')} src="whoosh" volume={0.5} />
      <div style={{ position: 'absolute', left: 110, top: 230, width: 1000, padding: '40px 46px', borderRadius: 36, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 34, rowGap: 18,
        background: 'linear-gradient(135deg, rgba(255,201,64,.18), rgba(224,81,255,.12))', border: '2px solid rgba(255,201,64,.55)', boxShadow: '0 30px 80px -30px rgba(255,201,64,.6)',
        opacity: ease(card, [0, 0.4], [0, 1]), scale: ease(card, [0, 1], [0.7, 1]), rotate: `${ease(card, [0, 1], [-8, 0])}deg` }}>
        <span style={{ fontSize: 130, lineHeight: 1, gridRow: 'span 2', translate: `0 ${Math.sin(frame / 14) * 6}px` }}>👵</span>
        <div>
          <div style={{ font: `700 24px ${FONT}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.gold }}>Missão secreta</div>
          <div style={{ font: `600 32px ${FONT}`, color: C.soft, marginTop: 6 }}>Dona Cida, 72 anos</div>
        </div>
        <div style={{ font: `800 58px/1.05 ${DISPLAY}` }}>Videochamada com os netos</div>
        <p style={{ gridColumn: '1 / -1', margin: 0, font: `500 32px/1.45 ${FONT}`, color: C.text }}>
          Todo dia, às 20h em ponto, a Dona Cida quer <mark style={{ color: 'inherit', background: `linear-gradient(transparent 55%, rgba(34,211,238,${0.55 * p('call')}) 55%)` }}>ver e ouvir os netos</mark> que moram em Portugal. Ela já avisou: “nada de joguinho nesse computador!”.
        </p>
        <p style={{ gridColumn: '1 / -1', margin: 0, font: `700 30px/1.4 ${FONT}`, color: '#ffe7a3', padding: '16px 22px', borderRadius: 18, background: `rgba(255,201,64,${0.06 + 0.12 * p('hint')})`, border: `2px solid rgba(255,201,64,${0.15 + 0.6 * p('hint')})`, scale: ease(p('hint'), [0, 0.5, 1], [1, 1.04, 1]) }}>
          💡 Pense em como os netos vão ver a vó e em como ela vai ouvir a família.
        </p>
      </div>
      <div style={{ position: 'absolute', left: 1200, top: 230, width: 620, display: 'grid', gap: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 24, borderRadius: 28, background: 'rgba(255,77,109,.1)', border: '2px solid rgba(255,77,109,.4)', opacity: p('skip', 0.3), scale: pop('skip') }}>
          <div style={{ position: 'relative' }}>
            <Item id="gpu-gamer" size={170} style={{ filter: 'grayscale(.8)', opacity: 0.6 }} />
            <svg viewBox="0 0 100 100" width="170" height="170" style={{ position: 'absolute', inset: 0 }}><path d="M18 18 L82 82 M82 18 L18 82" stroke={C.danger} strokeWidth="10" strokeLinecap="round" /></svg>
          </div>
          <div style={{ font: `700 34px/1.25 ${DISPLAY}` }}>Placa de vídeo gamer<div style={{ font: `600 26px ${FONT}`, color: '#ffb3c0', marginTop: 8 }}>não conta: ela não usa</div></div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {(['webcam', 'caixa-som'] as const).map((id, k) => (
            <div key={id} style={{ position: 'relative', flex: 1, display: 'grid', justifyItems: 'center', gap: 10, padding: 24, borderRadius: 28, background: 'rgba(46,230,166,.1)', border: '2px solid rgba(46,230,166,.45)', opacity: p('extra', 0.3, k * 0.3), scale: pop('extra', k * 0.3) }}>
              <Item id={id} size={150} />
              <span style={{ font: `700 28px ${FONT}`, color: C.ok }}>✓ {id === 'webcam' ? 'Webcam' : 'Caixa de som'}</span>
              <Points p={p('extra', 1.2, 0.2 + k * 0.3)} text="+8" x={150} y={40} size={72} />
            </div>
          ))}
        </div>
      </div>
      <Sfx at={at('extra', 0.2)} src="ding" volume={0.5} />
      <Sfx at={at('extra', 0.5)} src="ding" volume={0.5} />
    </AbsoluteFill>
  );
};
