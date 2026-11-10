import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ItemImg, Logo } from './ui.tsx';

// Explicação curta do tema para passar na TV antes do leilão. Navegação: ← → / espaço / clique.
const ATIVIDADE = `${location.host}${import.meta.env.BASE_URL}atividade`;
const at = (i: number) => ({ '--i': i }) as CSSProperties; // ordem de entrada de cada bloco

function Need({ id, label, no }: { id: string; label: string; no?: boolean }) {
  return (
    <figure className={`need ${no ? 'need-no' : ''}`}>
      <ItemImg id={id} size={88} />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

const SLIDES: { eyebrow: string; title: ReactNode; body: ReactNode }[] = [
  {
    eyebrow: 'Suporte Técnico e Atendimento ao Usuário',
    title: <>Empreendedorismo no <span className="grad">atendimento</span></>,
    body: (
      <>
        <p className="sl-lead in" style={at(2)}>Como transformar o problema de um cliente em uma boa solução e em trabalho para você.</p>
        <div className="sl-parts in" style={at(3)} aria-hidden="true">
          {['cpu-r5', 'ram-16', 'ssd-480', 'webcam', 'roteador', 'nobreak'].map((id, k) => (
            <span key={id} style={{ '--k': k } as CSSProperties}><ItemImg id={id} size={110} /></span>
          ))}
        </div>
      </>
    ),
  },
  {
    eyebrow: 'Para começar',
    title: 'O que é empreender?',
    body: (
      <>
        <p className="sl-big in" style={at(2)}>
          Empreender é <mark>enxergar um problema</mark> e <mark>criar uma solução</mark> que as pessoas querem.
        </p>
        <div className="flow">
          <div className="sl-card in" style={at(3)}><span className="ico">🔍</span><b>Problema</b><p>O computador da Dona Rosa vive travando.</p></div>
          <span className="flow-arrow in" style={at(4)} aria-hidden="true">→</span>
          <div className="sl-card in" style={at(5)}><span className="ico">🛠️</span><b>Solução</b><p>Trocar o HD antigo por um SSD.</p></div>
          <span className="flow-arrow in" style={at(6)} aria-hidden="true">→</span>
          <div className="sl-card in" style={at(7)}><span className="ico">🤝</span><b>Resultado</b><p>Ela fica feliz, volta e indica você para as amigas.</p></div>
        </div>
      </>
    ),
  },
  {
    eyebrow: 'Dois jeitos de atender',
    title: 'Vendedor de peça × técnico empreendedor',
    body: (
      <div className="versus">
        <div className="sl-card bad in" style={at(2)}>
          <b>❌ Só vende peça</b>
          <ul>
            <li>Empurra a peça mais cara</li>
            <li>Fala difícil, cheio de sigla</li>
            <li>Não pergunta nada</li>
          </ul>
          <p className="verdict">O cliente não volta.</p>
        </div>
        <div className="sl-card good in" style={at(3)}>
          <b>✅ Técnico empreendedor</b>
          <ul>
            <li>Escuta antes de oferecer</li>
            <li>Explica com palavras simples</li>
            <li>Indica o que resolve o problema</li>
          </ul>
          <p className="verdict">O cliente volta e indica você.</p>
        </div>
      </div>
    ),
  },
  {
    eyebrow: 'Passo 1',
    title: 'Escute antes de vender',
    body: (
      <>
        <div className="chat">
          <p className="bubble client in" style={at(2)}>🧑 “Quero um computador bom.”</p>
          <p className="bubble tech in" style={at(3)}>“Bom para quê?” 🧑‍🔧</p>
        </div>
        <ul className="asks">
          <li className="in" style={at(4)}>🎯 Para que você vai usar?</li>
          <li className="in" style={at(5)}>💰 Quanto pode gastar?</li>
          <li className="in" style={at(6)}>👥 Quem vai usar?</li>
          <li className="in" style={at(7)}>😤 O que mais te incomoda hoje?</li>
        </ul>
      </>
    ),
  },
  {
    eyebrow: 'Passo 2',
    title: 'Nem mais, nem menos',
    body: (
      <>
        <p className="sl-lead in" style={at(2)}>A solução certa resolve o problema do cliente pelo preço que ele pode pagar.</p>
        <div className="clients">
          <div className="sl-card in" style={at(3)}>
            <b>👵 Dona Cida</b>
            <p>Quer fazer videochamada com os netos.</p>
            <div className="needs">
              <Need id="webcam" label="Precisa" />
              <Need id="caixa-som" label="Precisa" />
              <Need id="gpu-gamer" label="Dinheiro jogado fora" no />
            </div>
          </div>
          <div className="sl-card in" style={at(4)}>
            <b>🎮 Kevin</b>
            <p>Quer jogar os lançamentos no gráfico máximo.</p>
            <div className="needs">
              <Need id="gpu-gamer" label="Precisa" />
              <Need id="psu-850" label="Precisa" />
              <Need id="headset" label="Precisa" />
            </div>
          </div>
        </div>
        <p className="sl-note in" style={at(5)}>Vender o que o cliente não precisa é o jeito mais rápido de perder esse cliente.</p>
      </>
    ),
  },
  {
    eyebrow: 'Passo 3',
    title: 'Enxergue oportunidades',
    body: (
      <>
        <p className="sl-lead in" style={at(2)}><b>Oportunidade de mercado</b> é um problema que muita gente tem e pouca gente resolve.</p>
        <div className="ops">
          {[
            ['roteador', 'O Wi-Fi não chega no quarto', 'Instalar e configurar um roteador'],
            ['nobreak', 'A luz cai e o trabalho se perde', 'Indicar e instalar um nobreak'],
            ['ssd-480', 'O computador está muito lento', 'Trocar o HD por SSD ou pôr mais memória'],
            ['webcam', 'A família não sabe fazer videochamada', 'Instalar a webcam e ensinar a usar'],
          ].map(([id, problem, service], k) => (
            <div className="sl-card op in" style={at(3 + k)} key={id}>
              <ItemImg id={id} size={84} />
              <p className="op-problem">{problem}</p>
              <p className="op-service">→ {service}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    eyebrow: 'Passo 4',
    title: 'O dinheiro do cliente é responsabilidade sua',
    body: (
      <>
        <ol className="ladder">
          <li className="in" style={at(2)}><span>1º</span><div><b>O que faz o computador funcionar</b><p>Sem isso, nada liga.</p></div></li>
          <li className="in" style={at(3)}><span>2º</span><div><b>O que o cliente pediu</b><p>É o que resolve o problema dele.</p></div></li>
          <li className="in" style={at(4)}><span>3º</span><div><b>Enfeite e luzinha</b><p>Só se sobrar dinheiro.</p></div></li>
        </ol>
        <p className="sl-note in" style={at(5)}>Compare preços, não gaste tudo de uma vez e explique cada escolha para o cliente.</p>
      </>
    ),
  },
  {
    eyebrow: 'Agora é com você',
    title: <>No <span className="grad">LeilãoTEC</span>, você é o técnico</>,
    body: (
      <>
        <p className="sl-lead in" style={at(2)}>Você vai ter um saldo, um cliente e peças disputadas pela turma. Escute a missão, gaste bem e monte o computador que resolve o problema.</p>
        <div className="sl-card go in" style={at(3)}>
          <p>Antes do leilão, faça a <b>trilha de 5 missões</b>:</p>
          <p className="sl-url">{ATIVIDADE}</p>
        </div>
      </>
    ),
  },
  {
    eyebrow: 'Antes de jogar',
    title: 'Como funciona o leilão',
    body: (
      <div className="sl-video in" style={at(2)}>
        <video src={`${import.meta.env.BASE_URL}video/leilaotec.mp4`} poster={`${import.meta.env.BASE_URL}video/poster.jpg`} controls playsInline preload="metadata" />
      </div>
    ),
  },
];

const fromHash = () => Math.min(SLIDES.length - 1, Math.max(0, Number(location.hash.slice(1)) - 1 || 0));

export function Slides() {
  const [n, setN] = useState(fromHash);
  const go = (k: number) => setN(Math.min(SLIDES.length - 1, Math.max(0, k)));

  useEffect(() => void (document.title = 'Empreendedorismo no atendimento · LeilãoTEC'), []);
  useEffect(() => history.replaceState(null, '', `#${n + 1}`), [n]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement && (e.key === ' ' || e.key === 'Enter')) return; // deixa o botão focado agir
      if (e.target instanceof HTMLVideoElement) return; // vídeo em foco: espaço e setas controlam o vídeo
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) setN((k) => Math.min(SLIDES.length - 1, k + 1));
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) setN((k) => Math.max(0, k - 1));
      else if (e.key === 'Home') setN(0);
      else if (e.key === 'End') setN(SLIDES.length - 1);
      else return;
      e.preventDefault();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});

  const slide = SLIDES[n];
  return (
    <div className="deck">
      <div className="mesh" aria-hidden="true"><i /><i /><i /></div>
      <div className="deck-progress" style={{ transform: `scaleX(${(n + 1) / SLIDES.length})` }} aria-hidden="true" />
      <main className="deck-stage">
        <section className="sl" key={n} aria-roledescription="slide" aria-label={`${n + 1} de ${SLIDES.length}`}>
          <p className="eyebrow in" style={at(0)}>{slide.eyebrow}</p>
          {n === 0 ? <h1 className="in" style={at(1)}>{slide.title}</h1> : <h2 className="in" style={at(1)}>{slide.title}</h2>}
          {slide.body}
        </section>
      </main>
      <nav className="deck-bar" aria-label="Navegação dos slides">
        <Logo small />
        <div className="dots">
          {SLIDES.map((_, k) => (
            <button key={k} className={k === n ? 'on' : ''} onClick={() => go(k)} aria-label={`Ir para o slide ${k + 1}`} aria-current={k === n} />
          ))}
        </div>
        <span className="deck-count">{n + 1} / {SLIDES.length}</span>
        <button className="icon-btn" onClick={() => go(n - 1)} disabled={n === 0} aria-label="Slide anterior">←</button>
        <button className="icon-btn" onClick={() => go(n + 1)} disabled={n === SLIDES.length - 1} aria-label="Próximo slide">→</button>
        <button className="icon-btn" onClick={fullscreen} title="Tela cheia" aria-label="Tela cheia">⛶</button>
      </nav>
    </div>
  );
}
