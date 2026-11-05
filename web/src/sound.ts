// Efeitos sonoros gerados no ElevenLabs (arquivos em public/sounds).
import { useSyncExternalStore } from 'react';

export type SoundName = 'roleta' | 'item' | 'contagem' | 'lance';

const cache = new Map<SoundName, HTMLAudioElement>();
const listeners = new Set<() => void>();
let muted = true;

const load = (name: SoundName) => {
  let a = cache.get(name);
  if (!a) {
    a = new Audio(`${import.meta.env.BASE_URL}sounds/${name}.mp3`);
    a.preload = 'auto';
    cache.set(name, a);
  }
  return a;
};

export function preloadSounds() {
  (['roleta', 'item', 'contagem', 'lance'] as SoundName[]).forEach(load);
}

export function play(name: SoundName, volume = 1) {
  if (muted) return;
  const node = load(name).cloneNode() as HTMLAudioElement;
  node.volume = volume;
  node.play().catch(() => {});
}

const apply = (value: boolean) => {
  muted = value;
  listeners.forEach((f) => f());
};

// Só a escolha da pessoa (botão 🔊/🔇) fica salva; o padrão de cada papel não.
export function setMuted(value: boolean) {
  apply(value);
  try {
    localStorage.setItem('leilaotec:mudo', value ? '1' : '0');
  } catch { /* sem storage */ }
}

// Professor (TV) começa com som; aluno começa mudo para a sala não virar 30 roletas ao mesmo tempo.
export function initMuted(defaultMuted: boolean) {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('leilaotec:mudo');
  } catch { /* sem storage */ }
  apply(saved === null ? defaultMuted : saved === '1');
}

export const useMuted = () =>
  useSyncExternalStore((f) => (listeners.add(f), () => void listeners.delete(f)), () => muted);
