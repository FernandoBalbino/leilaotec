import { AbsoluteFill, Easing } from 'remotion';
import { Bg, C, Center, Chip, Confetti, DISPLAY, Gavel, Grad, Item, Logo, Panel, Sfx, Stamp, Title, ease, useCue } from '../kit';

const ORBIT = ['cpu-r5', 'ram-16', 'mon-24', 'gpu-gamer', 'ssd-480', 'psu-600', 'mb-media', 'headset', 'webcam', 'cadeira'];

// Peças girando em volta do centro; acelera quando entra o leilão.
function Orbit({ fast }: { fast: number }) {
  const { frame } = useCue();
  return (
    <>
      {ORBIT.map((id, k) => {
        const a = (k / ORBIT.length) * Math.PI * 2 + frame * (0.005 + fast * 0.02);
        return (
          <div key={id} style={{ position: 'absolute', left: 960 + Math.cos(a) * 820, top: 540 + Math.sin(a) * 400, translate: '-50% -50%',
            scale: ease(frame, [k * 3, k * 3 + 18], [0, 1], Easing.back(1.8)), opacity: 0.9 }}>
            <Item id={id} size={150} />
          </div>
        );
      })}
    </>
  );
}

// Batida do martelo: treme a tela e carimba o texto.
// gx: onde fica o martelo (a cabeça bate no canto direito do carimbo, sem cobrir o texto)
function Slam({ at, text, y, gx, size = 110 }: { at: number; text: string; y: number; gx: number; size?: number }) {
  const { frame } = useCue();
  const fall = ease(frame, [at, at + 9], [0, 1], Easing.in(Easing.cubic));
  const hit = frame - (at + 9);
  return (
    <>
      <Sfx at={at + 8} src="lance" volume={0.9} />
      <div style={{ position: 'absolute', left: 960, top: y, translate: '-50% -50%' }}><Stamp p={hit >= 0 ? ease(hit, [0, 14], [0, 1]) : 0} text={text} color={C.gold} size={size} /></div>
      <div style={{ position: 'absolute', left: gx, top: y - 280, opacity: ease(frame, [at - 6, at], [0, 1]) }}><Gavel p={fall} size={340} /></div>
    </>
  );
}

const shake = (frame: number, at: number) => {
  const d = frame - at;
  return d < 0 || d > 14 ? '0px 0px' : `${Math.sin(d * 2.2) * (14 - d) * 1.4}px ${Math.cos(d * 2.9) * (14 - d)}px`;
};

export const S1 = () => {
  const { frame, at, p, pop } = useCue();
  const hitAt = at('auction', 0.4);
  return (
    <AbsoluteFill style={{ translate: shake(frame, hitAt + 9) }}>
      <Bg />
      <Orbit fast={p('auction', 0.6)} />
      <Sfx at={at('logo')} src="whoosh" volume={0.6} />
      <Center style={{ gap: 34, translate: `0 ${ease(frame, [hitAt, hitAt + 12], [0, -90])}px` }}>
        <Title size={150} style={{ position: 'absolute', opacity: ease(frame, [0, 8, at('logo') - 6, at('logo')], [0, 1, 1, 0]), scale: ease(frame, [0, 14], [0.6, 1], Easing.back(2)) }}>
          Fala, turma! 👋
        </Title>
        <div style={{ scale: 1.6 * pop('logo', 0, 14), opacity: p('logo', 0.2) }}><Logo size={86} p={p('logo', 1)} /></div>
        <div style={{ opacity: p('tech'), translate: `0 ${ease(p('tech'), [0, 1], [30, 0])}px`, marginTop: 40 }}>
          <Chip size={40} bg="rgba(34,211,238,.14)" fg="#9eeefc">🧑‍🔧 Você é o técnico de informática</Chip>
        </div>
        <Title size={88} style={{ opacity: p('pc'), translate: `0 ${ease(p('pc'), [0, 1], [40, 0])}px` }}>
          Monte o PC mais <Grad>funcional</Grad> da turma
        </Title>
      </Center>
      <Slam at={hitAt} text="NUM LEILÃO!" y={900} gx={1300} />
    </AbsoluteFill>
  );
};

const LESSONS: [string, string, string][] = [['listen', '👂', 'Escute o cliente'], ['spend', '💰', 'Gaste com cuidado'], ['first', '⭐', 'Compre primeiro o essencial']];

export const S10 = () => {
  const { frame, at, p, pop } = useCue();
  const out = p('ready', 0.5);
  const goAt = at('go');
  return (
    <AbsoluteFill style={{ translate: shake(frame, goAt + 9) }}>
      <Bg />
      <Center style={{ gap: 30, opacity: 1 - out, translate: `0 ${-out * 80}px` }}>
        <div style={{ font: `700 40px ${DISPLAY}`, color: C.accent2, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: ease(frame, [0, 10], [0, 1]) }}>Resumindo</div>
        {LESSONS.map(([cue, ico, text]) => (
          <Panel key={cue} style={{ width: 1240, padding: '30px 44px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 34, scale: pop(cue), opacity: p(cue, 0.2) }}>
            <span style={{ fontSize: 76 }}>{ico}</span>
            <span style={{ font: `800 66px ${DISPLAY}` }}>{text}</span>
          </Panel>
        ))}
      </Center>
      <Center style={{ gap: 40, opacity: out }}>
        <Title size={150} style={{ scale: ease(frame, [at('ready'), at('ready') + 14], [0.6, 1], Easing.back(2)), opacity: ease(frame, [goAt - 4, goAt + 4], [1, 0]), position: 'absolute' }}>Preparados?</Title>
        <div style={{ opacity: p('go', 0.2), scale: 1.5 * pop('go', 0, 14), translate: '0 -120px' }}><Logo size={80} p={p('go', 1)} /></div>
      </Center>
      <Slam at={at('go', 0.3)} text="QUE COMECE O LEILÃO!" y={760} gx={1440} size={90} />
      <Confetti at={at('go', 0.3) + 10} />
    </AbsoluteFill>
  );
};
