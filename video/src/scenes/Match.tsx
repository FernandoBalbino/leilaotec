import { AbsoluteFill, Easing } from 'remotion';
import { Avatar, Bg, Bubble, Burst, C, Chip, Confetti, DISPLAY, FONT, Item, Meter, PLAYERS, Sfx, Stamp, Title, brl, ease, lerp, useCue, type Who } from '../kit';

// Partida simulada: Ana leva o processador; Bruno gasta tudo numa cadeira gamer.
const SIDE: Record<'Ana' | 'Bruno', { x: number; slot: [number, number] }> = { Ana: { x: 90, slot: [300, 800] }, Bruno: { x: 1330, slot: [1540, 800] } };

function Player({ who, balance, items, shake = 0 }: { who: 'Ana' | 'Bruno'; balance: number; items: string[]; shake?: number }) {
  const { x } = SIDE[who];
  return (
    <div style={{ position: 'absolute', left: x, top: 220, width: 500, height: 720, borderRadius: 36, padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, fontFamily: FONT,
      background: 'rgba(255,255,255,.05)', border: `3px solid ${PLAYERS[who]}66`, translate: `${Math.sin(shake * 40) * shake * 14}px 0` }}>
      <Avatar who={who} size={180} />
      <div style={{ font: `800 60px ${DISPLAY}`, color: C.text }}>{who}</div>
      <div style={{ font: `800 46px ${DISPLAY}`, color: C.gold }}>{brl(Math.round(balance / 10) * 10)}</div>
      <div style={{ marginTop: 'auto', width: '100%', height: 220, borderRadius: 24, border: `2px dashed ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {items.length ? items.map((id) => <Item key={id} id={id} size={170} />) : <span style={{ font: `500 26px ${FONT}`, color: C.muted }}>nenhuma peça ainda</span>}
      </div>
    </div>
  );
}

export const S8 = () => {
  const { frame, at, p } = useCue();
  const soldAt = at('sold', 0.4);
  const fly1 = ease(frame, [soldAt + 20, soldAt + 40], [0, 1], Easing.inOut(Easing.cubic));
  const chairIn = at('chair');
  const fly2 = ease(frame, [at('spend', 1.1), at('spend', 1.8)], [0, 1], Easing.inOut(Easing.cubic));
  const joke = p('joke', 0.4);
  const lot = (id: string, price: number, inAt: number, fly: number, to: [number, number], show: boolean) =>
    show && (
      <div style={{ position: 'absolute', left: lerp(fly, 960, to[0]), top: lerp(fly, 500, to[1]), translate: '-50% -50%', scale: ease(frame, [inAt, inAt + 14], [0, 1], Easing.back(1.8)) * lerp(fly, 1, 0.55), opacity: fly >= 1 ? 0 : 1 }}>
        <div style={{ position: 'absolute', inset: -60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,255,.5), transparent 70%)', opacity: 1 - fly }} />
        <Item id={id} size={320} />
        <div style={{ position: 'absolute', right: -30, bottom: 10, rotate: '-5deg', font: `800 44px ${DISPLAY}`, color: '#2a1a00', background: C.gold, padding: '6px 20px', borderRadius: 14, opacity: 1 - fly }}>{brl(price)}</div>
      </div>
    );
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Bg />
      <div style={{ position: 'absolute', top: 70, width: '100%', display: 'flex', justifyContent: 'center', opacity: p('go', 0.3) }}>
        <Chip size={40} bg="rgba(34,211,238,.14)" fg="#9eeefc">▶ Partida de exemplo</Chip>
      </div>
      <Player who="Ana" balance={lerp(fly1, 3000, 2490)} items={fly1 >= 1 ? ['cpu-r5'] : []} />
      <Player who="Bruno" balance={lerp(fly2, 3000, 2500)} items={fly2 >= 1 ? ['cadeira'] : []} shake={frame >= at('joke') && frame < at('joke') + 18 ? (18 - (frame - at('joke'))) / 18 : 0} />
      {lot('cpu-r5', 450, at('cpu'), fly1, SIDE.Ana.slot, frame < chairIn)}
      {lot('cadeira', 500, chairIn, fly2, SIDE.Bruno.slot, frame >= chairIn)}
      <Sfx at={at('cpu')} src="item" volume={0.6} />
      <Sfx at={chairIn} src="item" volume={0.6} />
      {/* balões de lance */}
      {frame < soldAt + 16 && (
        <>
          {/* Ana fala do lado esquerdo do item, Bruno do direito (sem encostar nos cartões) */}
          <Bubble p={p('ana1', 0.3) * (1 - p('bruno', 0.2))} text={brl(450)} color={PLAYERS.Ana} style={{ right: 975, top: 230 }} />
          <Bubble p={p('bruno', 0.3) * (1 - p('ana2', 0.2))} text={brl(460)} color={PLAYERS.Bruno} style={{ left: 975, top: 230 }} />
          <Bubble p={p('ana2', 0.3)} text={brl(510)} color={PLAYERS.Ana} style={{ right: 975, top: 230 }} />
        </>
      )}
      {(['ana1', 'bruno', 'ana2', 'spend'] as const).map((c) => <Sfx key={c} at={at(c)} src="lance" volume={0.45} len={20} />)}
      <div style={{ position: 'absolute', left: 960, top: 820, translate: '-50% -50%', opacity: ease(frame, [soldAt, soldAt + 4, soldAt + 40, soldAt + 50], [0, 1, 1, 0]) }}>
        <Stamp p={ease(frame, [soldAt, soldAt + 14], [0, 1])} size={90} />
      </div>
      <Sfx at={soldAt} src="ding" volume={0.6} />
      <Burst p={ease(frame, [soldAt, soldAt + 24], [0, 1])} x={960} y={500} color={C.ok} />
      {frame >= chairIn && <Bubble p={p('spend', 0.3) * (1 - fly2)} text={brl(500)} color={PLAYERS.Bruno} style={{ left: 975, top: 230 }} />}
      {/* piada */}
      <div style={{ position: 'absolute', left: 960, top: 560, translate: '-50% -50%', opacity: joke, scale: ease(joke, [0, 1], [0.6, 1], Easing.back(2)) }}>
        <div style={{ font: `800 64px/1.15 ${DISPLAY}`, textAlign: 'center', padding: '30px 44px', borderRadius: 32, background: 'rgba(12,16,48,.92)', border: `3px solid ${C.gold}`, boxShadow: '0 30px 80px -20px rgba(255,201,64,.5)', width: 680 }}>
          😅 Bruno, cadeira não liga computador!
        </div>
      </div>
      <Sfx at={at('joke')} src="whoosh" volume={0.6} />
    </AbsoluteFill>
  );
};

// Apresentação final na TV: do menor para o maior, com o que faltou; depois o pódio.
const MISSING: Record<'Bruno' | 'Ana', string[]> = { Bruno: ['Placa-mãe', 'Processador', 'Memória RAM', 'HD ou SSD', 'Fonte'], Ana: ['Placa de vídeo'] };

function Slide({ who, percent, missing, show }: { who: 'Bruno' | 'Ana'; percent: number; missing: number; show: number }) {
  return (
    <AbsoluteFill style={{ opacity: show, translate: `${(1 - show) * 140}px 0`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 90, fontFamily: FONT, color: C.text }}>
      <div style={{ display: 'grid', justifyItems: 'center', gap: 18 }}>
        <Avatar who={who} size={260} />
        <div style={{ font: `800 80px ${DISPLAY}` }}>{who}</div>
      </div>
      <div style={{ display: 'grid', gap: 40 }}>
        <Meter percent={percent} width={1000} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, maxWidth: 1000, alignItems: 'center', opacity: missing }}>
          <span style={{ font: `700 32px ${FONT}`, color: '#ff8fa3', marginRight: 6 }}>Faltou:</span>
          {MISSING[who].map((m, k) => (
            <span key={m} style={{ opacity: ease(missing, [k * 0.12, k * 0.12 + 0.3], [0, 1]) }}><Chip size={30} bg="rgba(255,77,109,.16)" fg="#ffb3c0">{m}</Chip></span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

const PODIUM: [Who, number, number, number][] = [['Carla', 2, 82, 230], ['Ana', 1, 90, 330], ['Davi', 3, 75, 160]];

export const S9 = () => {
  const { frame, at, p } = useCue();
  const bruno = p('each', 0.4) * (1 - p('ana', 0.4));
  const ana = p('ana', 0.4) * (1 - p('podium', 0.4));
  const podium = p('podium', 0.5);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Bg />
      <AbsoluteFill style={{ display: 'grid', placeItems: 'center', opacity: ease(frame, [0, 8, at('each') - 6, at('each')], [0, 1, 1, 0]) }}>
        <Title size={150} style={{ scale: ease(frame, [0, 16], [0.6, 1], Easing.back(2)) }}>Fim da partida! 🏁</Title>
      </AbsoluteFill>
      <Slide who="Bruno" percent={ease(frame, [at('each', 0.3), at('bruno', 0.6)], [0, 40])} missing={p('missing', 1.2)} show={bruno} />
      <Slide who="Ana" percent={ease(frame, [at('ana', 0.3), at('ana', 1.6)], [0, 90])} missing={p('ana', 0.8, 1.4)} show={ana} />
      <Sfx at={at('each')} src="whoosh" volume={0.5} />
      <Sfx at={at('ana')} src="whoosh" volume={0.5} />
      <AbsoluteFill style={{ opacity: podium, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <Title size={96}>Pódio do <span style={{ color: C.accent2 }}>LeilãoTEC</span></Title>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 40 }}>
          {PODIUM.map(([who, pos, pct, h], k) => (
            <div key={who} style={{ display: 'grid', justifyItems: 'center', gap: 14, translate: `0 ${ease(frame, [at('podium', 0.2 + k * 0.15), at('podium', 0.6 + k * 0.15)], [300, 0], Easing.back(1.4))}px` }}>
              {pos === 1 && <span style={{ fontSize: 70 }}>👑</span>}
              <Avatar who={who} size={pos === 1 ? 150 : 120} />
              <span style={{ font: `800 46px ${DISPLAY}` }}>{who}</span>
              <span style={{ font: `700 36px ${FONT}`, color: C.soft }}>{pct}%</span>
              <div style={{ width: 300, height: h, borderRadius: '24px 24px 0 0', display: 'grid', placeItems: 'center', font: `800 100px ${DISPLAY}`,
                background: pos === 1 ? 'linear-gradient(180deg, #ffd45e, #b07b00)' : `linear-gradient(180deg, ${PLAYERS[who]}aa, #11143a)`, color: pos === 1 ? '#2a1a00' : '#fff' }}>{pos}º</div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Confetti at={at('podium', 0.6)} />
      <Sfx at={at('podium', 0.6)} src="ding" volume={0.7} />
    </AbsoluteFill>
  );
};
