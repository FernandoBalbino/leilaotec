import React from 'react';
import { AbsoluteFill, Sequence, Series, staticFile, useCurrentFrame } from 'remotion';
import { Audio } from '@remotion/media';
import { C, CueCtx, ease } from './kit';
import { TIMELINE } from './timing';
import { S1, S10 } from './scenes/Intro';
import { S2 } from './scenes/Join';
import { S3 } from './scenes/Wheel';
import { S4, S5 } from './scenes/Bid';
import { S6, S7 } from './scenes/Score';
import { S8, S9 } from './scenes/Match';

const SCENES: Record<string, React.FC> = { s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6, s7: S7, s8: S8, s9: S9, s10: S10 };

// Entrada e saída suaves de cada cena (leve zoom + fade)
function Frame({ dur, children }: { dur: number; children: React.ReactNode }) {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: ease(f, [0, 8], [0, 1]) * ease(f, [dur - 8, dur], [1, 0]), scale: ease(f, [0, 16], [1.04, 1]) }}>
      {children}
    </AbsoluteFill>
  );
}

export const LeilaoVideo: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Series>
      {TIMELINE.map((s) => {
        const Scene = SCENES[s.id] ?? (() => null);
        return (
          <Series.Sequence key={s.id} durationInFrames={s.dur} name={s.id}>
            <CueCtx.Provider value={{ cues: s.cues, dur: s.dur }}>
              <Frame dur={s.dur}><Scene /></Frame>
            </CueCtx.Provider>
            {s.audio && <Sequence from={s.lead} layout="none"><Audio src={staticFile(s.audio)} /></Sequence>}
            <Audio src={staticFile('sfx/whoosh.wav')} volume={0.3} />
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
