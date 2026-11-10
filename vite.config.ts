import { copyFileSync, mkdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const ROUTES = ['slide', 'atividade'];
const dist = new URL('./dist/', import.meta.url);

export default defineConfig({
  root: 'web',
  base: '/leilaotec/',
  plugins: [
    react(),
    {
      // GitHub Pages não tem fallback de SPA: cada rota ganha a própria cópia do index.html.
      name: 'rotas-estaticas',
      apply: 'build',
      closeBundle() {
        for (const r of ROUTES) {
          mkdirSync(new URL(`${r}/`, dist), { recursive: true });
          copyFileSync(new URL('index.html', dist), new URL(`${r}/index.html`, dist));
        }
      },
    },
  ],
  server: { host: '0.0.0.0', port: 5173 },
  build: { outDir: '../dist', emptyOutDir: true, target: 'es2022' },
});
