import { Composition } from 'remotion';
import { LeilaoVideo } from './Video';
import { FPS, TOTAL } from './timing';

export const RemotionRoot: React.FC = () => (
  <Composition id="LeilaoTEC" component={LeilaoVideo} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
