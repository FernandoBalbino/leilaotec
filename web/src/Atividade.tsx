import confetti from 'canvas-confetti';
import { useEffect, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { Logo, TypedTextarea } from './ui.tsx';

// Trilha de 5 missões antes do leilão: 2 sobre o tema, 2 sobre o jogo e 1 sobre as peças.
// As respostas ficam só neste navegador (sessionStorage); o objetivo é o aluno pensar antes de jogar.
interface Mission { emoji: string; area: string; title: string; question: string; min: number; tip: string }

const MISSIONS: Mission[] = [
  {
    emoji: '🎧', area: 'Atendimento ao cliente', title: 'Escute o cliente', min: 40,
    question: 'Um cliente chega e diz: “Quero um computador bom”. Antes de indicar qualquer peça, que perguntas você faria para ele? Escreva pelo menos duas e explique por que elas são importantes.',
    tip: 'Técnico empreendedor pergunta antes de vender: para que o cliente vai usar, quanto pode gastar e o que mais incomoda hoje.',
  },
  {
    emoji: '💡', area: 'Empreendedorismo', title: 'Enxergue a oportunidade', min: 40,
    question: 'Pense no seu bairro ou na sua família: que problema com computador, celular ou internet muita gente tem? Que serviço você poderia oferecer para resolver esse problema e ganhar dinheiro com isso?',
    tip: 'Oportunidade de mercado é um problema que muita gente tem e pouca gente resolve. Quem resolve bem é indicado para os outros.',
  },
  {
    emoji: '💰', area: 'Estratégia do leilão', title: 'Planeje o seu saldo', min: 40,
    question: 'No LeilãoTEC o seu saldo é limitado e as peças aparecem uma de cada vez, sem você saber qual vem depois. Como você vai dividir o seu dinheiro? O que vale a pena comprar primeiro e o que você deixaria passar?',
    tip: 'Dica para o leilão: não gaste tudo nas primeiras peças. Peça repetida não soma (só conta a melhor) e, no modo clássico, acessório não deixa o computador mais funcional.',
  },
  {
    emoji: '🎯', area: 'Estratégia do leilão', title: 'Atenda o cliente secreto', min: 40,
    question: 'No modo Missão do cliente, o seu cliente é o Seu Benedito: ele tem uma oficina mecânica, imprime orçamentos o dia inteiro e a energia da rua cai toda semana. Na roleta sai uma placa de vídeo gamer e a turma toda começa a disputar. Você entraria nessa disputa? O que você tentaria comprar para ele?',
    tip: 'Dica para o leilão: leia a história e a dica da sua missão com calma. Peça que o cliente não precisa não vale ponto, e cada acessório que ele pediu vale.',
  },
  {
    emoji: '🧩', area: 'Peças do computador', title: 'Lembre das peças', min: 60,
    question: 'Sem pesquisar: quais peças um computador precisa para ligar e funcionar? Escreva pelo menos 5 peças e diga, com as suas palavras, o que cada uma faz.',
    tip: '',
  },
];

const KEY = 'leilaotec:atividade';
const JOIN_URL = `${import.meta.env.BASE_URL}?sala=`; // abre direto "Entrar na sala" (código + nome)

interface Progress { answers: string[]; step: number } // step 0–4 = missão atual; 5 = trilha completa

function load(): Progress {
  try {
    const p = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    if (Array.isArray(p?.answers) && p.answers.length === MISSIONS.length && Number.isInteger(p.step)) return p;
  } catch { /* sem storage ou dado estranho: começa do zero */ }
  return { answers: MISSIONS.map(() => ''), step: 0 };
}

export function Atividade() {
  const [{ answers, step }, setProgress] = useState(load);
  const [cleared, setCleared] = useState(false); // acabou de enviar: mostra "missão cumprida" antes da próxima
  const [warn, setWarn] = useState('');
  const done = step >= MISSIONS.length;

  useEffect(() => void (document.title = 'Trilha de missões · LeilãoTEC'), []);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ answers, step }));
    } catch { /* sem storage: o progresso só fica na tela */ }
  }, [answers, step]);
  useEffect(() => setWarn(''), [step]);

  const noCopy = (e: SyntheticEvent) => (e.preventDefault(), setWarn('Copiar está desativado nesta atividade. Leia e responda com as suas palavras 🙂'));
  const mission = MISSIONS[Math.min(step, MISSIONS.length - 1)];
  const text = answers[step] ?? '';
  const len = text.trim().length;
  const send = () => {
    if (len < mission.min) return;
    setProgress({ answers, step: step + 1 });
    setCleared(true);
  };

  return (
    <div className="trail" onCopy={noCopy} onCut={noCopy}>
      <div className="mesh" aria-hidden="true"><i /><i /><i /></div>
      <header className="trail-top">
        <Logo />
        <span className="pill">{Math.min(step, MISSIONS.length)} de {MISSIONS.length} missões</span>
      </header>
      <main className="trail-main">
        <div className="trail-head">
          <p className="eyebrow">Antes do leilão</p>
          <h1>Trilha do técnico</h1>
          <p>Cumpra as 5 missões para liberar a entrada na sala. Responda com as suas palavras: colar está desativado.</p>
        </div>

        <div className="path" style={{ '--p': Math.min(step, MISSIONS.length - 1) / (MISSIONS.length - 1) } as CSSProperties}>
          <div className="path-fill" aria-hidden="true" />
          <ol className="nodes">
            {MISSIONS.map((m, k) => {
              const state = k < step ? 'done' : k === step ? 'now' : 'locked';
              return (
                <li key={k} className={`node ${state}`} aria-current={state === 'now' ? 'step' : undefined}>
                  <span className="node-dot" aria-hidden="true">{state === 'done' ? '✓' : state === 'locked' ? '🔒' : m.emoji}</span>
                  <small>Missão {k + 1}</small>
                  <b>{m.title}</b>
                  <span className="sr-only">{state === 'done' ? 'cumprida' : state === 'now' ? 'atual' : 'bloqueada'}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {cleared && !done ? (
          <section className="m-card m-clear" aria-live="polite">
            <span className="m-check" aria-hidden="true">✓</span>
            <h2>Missão {step} cumprida!</h2>
            <p className="m-tip">💡 {MISSIONS[step - 1].tip}</p>
            <button className="btn btn-primary btn-xl" autoFocus onClick={() => setCleared(false)}>
              Ir para a missão {step + 1} →
            </button>
          </section>
        ) : !done ? (
          <section className="m-card" key={step} aria-labelledby="m-title">
            <div className="m-head">
              <span className="m-emoji" aria-hidden="true">{mission.emoji}</span>
              <div>
                <small className="m-step">Missão {step + 1} de {MISSIONS.length}</small>
                <h2 id="m-title">{mission.title}</h2>
              </div>
              <span className="chip chip-area">{mission.area}</span>
            </div>
            <p className="m-q">{mission.question}</p>
            <TypedTextarea
              aria-labelledby="m-title"
              value={text}
              maxLength={800}
              rows={5}
              placeholder="Escreva a sua resposta aqui…"
              onChange={(e) => (setWarn(''), setProgress({ step, answers: answers.map((a, j) => (j === step ? e.target.value : a)) }))}
              onBlocked={() => setWarn('Colar está desativado. Escreva com as suas palavras 🙂')}
            />
            {warn && <p className="bid-msg err" role="alert">{warn}</p>}
            <div className="m-foot">
              <small className={`m-count ${len >= mission.min ? 'ok' : ''}`}>
                {len >= mission.min ? '✓ Pronto para enviar' : `${len}/${mission.min} letras no mínimo`}
              </small>
              <button className="btn btn-primary btn-xl" disabled={len < mission.min} onClick={send}>
                {step === MISSIONS.length - 1 ? 'Enviar e concluir a trilha 🏁' : 'Enviar resposta →'}
              </button>
            </div>
          </section>
        ) : null}
      </main>
      {done && <Finish />}
    </div>
  );
}

function Finish() {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, disableForReducedMotion: true });
    const id = setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true });
      confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true });
    }, 500);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="trail-final" role="dialog" aria-modal="true" aria-labelledby="tf-title">
      <div className="tf-card">
        <span className="tf-trophy" aria-hidden="true">🏆</span>
        <p className="eyebrow">Trilha completa</p>
        <h1 id="tf-title">Você cumpriu as <span className="grad">5 missões</span>!</h1>
        <p>Agora é a hora do leilão. Fique de olho na TV: o código da sala vai aparecer lá.</p>
        <ul className="tf-badges" aria-label="Missões cumpridas">
          {MISSIONS.map((m, k) => (
            <li key={k} style={{ '--k': k } as CSSProperties} title={m.title}>{m.emoji}</li>
          ))}
        </ul>
        <a className="btn btn-primary tf-go" href={JOIN_URL} ref={(a) => a?.focus()}>Entrar na sala do leilão 🔨</a>
        <small className="muted">Você vai digitar o código da sala e o seu nome.</small>
      </div>
    </div>
  );
}
