import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { Atividade } from './Atividade.tsx';
import { Slides } from './Slides.tsx';
import './styles.css';

// Rotas pelo endereço: /leilaotec/slide e /leilaotec/atividade (o build copia o index.html para essas pastas).
const route = location.pathname.slice(import.meta.env.BASE_URL.length).replace(/\/+$/, '');
const Page = route === 'slide' ? Slides : route === 'atividade' ? Atividade : App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
