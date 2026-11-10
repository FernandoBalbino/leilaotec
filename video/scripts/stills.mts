// Tira prints de vários quadros de uma vez (para conferir o visual sem renderizar o vídeo todo).
// Uso (dentro de video/): node scripts/stills.mts 60 280 420 ...   → out/f60.jpeg, out/f280.jpeg...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: 'src/index.ts' });
const composition = await selectComposition({ serveUrl, id: 'LeilaoTEC' });
for (const frame of frames) {
  await renderStill({ composition, serveUrl, frame, output: `out/f${frame}.jpeg`, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.5 });
  console.log(`out/f${frame}.jpeg`);
}
