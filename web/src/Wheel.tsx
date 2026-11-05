import { useEffect, useMemo, useRef } from 'react';
import { SPIN_MS, type Lot } from '../../shared/protocol.ts';
import { serverNow } from './net.ts';
import { play } from './sound.ts';
import { itemSrc, reducedMotion } from './ui.tsx';

const R = 470;
const TURNS = 8;
const ease = (t: number) => 1 - (1 - t) ** 4;
const polar = (deg: number, r: number) => [r * Math.sin((deg * Math.PI) / 180), -r * Math.cos((deg * Math.PI) / 180)];

// Roleta com as peças restantes. Todos os navegadores giram igual: o servidor manda o item e a hora do início.
export function Wheel({ items, secret, lot, sound = true }: { items: string[]; secret: string[]; lot: Lot; sound?: boolean }) {
  const disc = useRef<HTMLDivElement>(null);
  const pointer = useRef<SVGGElement>(null);
  const n = items.length;
  const seg = 360 / n;
  const target = useMemo(() => {
    const idx = Math.max(0, items.indexOf(lot.itemId));
    const jitter = (((lot.spinStartAt % 997) / 997) - 0.5) * seg * 0.6;
    return 360 * TURNS + (360 - (idx + 0.5) * seg) + jitter;
  }, [items, lot.itemId, lot.spinStartAt, seg]);

  useEffect(() => {
    const el = disc.current;
    if (!el) return;
    if (sound && serverNow() - lot.spinStartAt < 600) play('roleta');
    let raf = 0;
    let lastSeg = -1;
    let lastFlap = 0;
    const frame = () => {
      const t = Math.min(1, Math.max(0, (serverNow() - lot.spinStartAt) / SPIN_MS));
      const angle = reducedMotion() ? target * (t < 1 ? 0 : 1) : target * ease(t);
      el.style.transform = `rotate(${angle}deg)`;
      const s = Math.floor((angle + seg / 2) / seg);
      const now = performance.now();
      if (s !== lastSeg && now - lastFlap > 55) {
        lastSeg = s;
        lastFlap = now;
        pointer.current?.animate([{ transform: 'rotate(-16deg)' }, { transform: 'rotate(0deg)' }], { duration: 140, easing: 'ease-out' });
      }
      if (t < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [target, lot.spinStartAt, seg, sound]);

  // Fatias alternam entre dois anéis: cada imagem pode ter quase 2 fatias de largura.
  const ring = (k: number) => (k % 2 ? 0.66 : 0.84) * R;
  const sizeAt = (r: number) => Math.min(120, ((2 * Math.PI * r) / n) * (n > 12 ? 1.75 : 0.85));
  const secretSet = new Set(secret);
  return (
    <div className="wheel-wrap">
      <div className="wheel-glow" aria-hidden="true" />
      <div className="wheel-disc" ref={disc}>
        <svg viewBox="-500 -500 1000 1000" role="img" aria-label={`Roleta com ${n} itens`}>
          <defs>
            <radialGradient id="seg-a" r="1">
              <stop offset=".25" stopColor="#1a1f4d" />
              <stop offset="1" stopColor="#2b2f86" />
            </radialGradient>
            <radialGradient id="seg-b" r="1">
              <stop offset=".25" stopColor="#0f1838" />
              <stop offset="1" stopColor="#123e6e" />
            </radialGradient>
            <radialGradient id="seg-c" r="1">
              <stop offset=".25" stopColor="#1d1240" />
              <stop offset="1" stopColor="#4a1f86" />
            </radialGradient>
            <radialGradient id="seg-secret" r="1">
              <stop offset=".25" stopColor="#3a0b52" />
              <stop offset="1" stopColor="#a12bd6" />
            </radialGradient>
          </defs>
          <circle r={R + 22} fill="#0a0d24" stroke="#7c5cff" strokeWidth="6" />
          {items.map((id, k) => {
            const a0 = k * seg;
            const a1 = a0 + seg;
            const [x0, y0] = polar(a0, R);
            const [x1, y1] = polar(a1, R);
            const fill = secretSet.has(id) ? 'url(#seg-secret)' : `url(#seg-${'abc'[k % 3]})`;
            return (
              <g key={id}>
                <path d={`M0 0L${x0} ${y0}A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1}Z`} fill={fill} stroke="#05061a" strokeWidth="2" />
                <g transform={`rotate(${a0 + seg / 2})`}>
                  <image href={itemSrc(id, true)} x={-sizeAt(ring(k)) / 2} y={-ring(k) - sizeAt(ring(k)) / 2} width={sizeAt(ring(k))} height={sizeAt(ring(k))} />
                  {secretSet.has(id) && <text y={-R * 0.47} textAnchor="middle" fontSize="30">🔒</text>}
                </g>
              </g>
            );
          })}
          {Array.from({ length: 36 }, (_, k) => {
            const [x, y] = polar(k * 10, R + 11);
            return <circle key={k} cx={x} cy={y} r="5.5" className={`bulb ${k % 2 ? 'odd' : ''}`} />;
          })}
          <circle r="92" fill="#070915" stroke="#7c5cff" strokeWidth="5" />
          <circle r="70" fill="url(#seg-a)" />
          <text y="-6" textAnchor="middle" className="hub-text">LEILÃO</text>
          <text y="30" textAnchor="middle" className="hub-text hub-tec">TEC</text>
        </svg>
      </div>
      <svg className="wheel-pointer" viewBox="-40 -10 80 90" aria-hidden="true">
        <g ref={pointer} style={{ transformOrigin: '0px 0px' }}>
          <path d="M-26 0h52L0 70z" fill="#ffc940" stroke="#fff" strokeWidth="4" strokeLinejoin="round" />
          <circle r="9" fill="#fff" />
        </g>
      </svg>
    </div>
  );
}
