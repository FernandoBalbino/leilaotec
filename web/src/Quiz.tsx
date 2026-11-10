import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ANSWER_MAX, ANSWER_MIN, type AnswerSheet, type PublicRoom } from '../../shared/protocol.ts';
import { buildQuestions } from '../../shared/questions.ts';
import { send } from './net.ts';
import { Avatar, TypedTextarea } from './ui.tsx';

const draftKey = (room: PublicRoom, meId: string) => `leilaotec:respostas:${room.code}:${room.matchEndsAt}:${meId}`;

// As 5 perguntas do fim da partida. Colar/arrastar texto fica bloqueado: a resposta tem que ser digitada.
export function Quiz({ room, meId }: { room: PublicRoom; meId: string }) {
  const questions = useMemo(() => buildQuestions(room, meId), [room.history, room.players, room.missions, meId]); // eslint-disable-line react-hooks/exhaustive-deps
  const [answers, setAnswers] = useState<string[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem(draftKey(room, meId)) ?? 'null') ?? Array(5).fill('');
    } catch {
      return Array(5).fill('');
    }
  });
  const [warn, setWarn] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const done = room.answered.includes(meId);

  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey(room, meId), JSON.stringify(answers));
    } catch { /* sem storage: rascunho só fica na tela */ }
  }, [answers, room, meId]);

  if (done)
    return (
      <section className="quiz quiz-done">
        <h2>✅ Respostas enviadas!</h2>
        <p>Aguarde o professor começar a próxima partida.</p>
      </section>
    );

  const blocked = () => setWarn('Colar está desativado. Escreva com as suas palavras 🙂');
  const left = answers.filter((a) => a.trim().length < ANSWER_MIN).length;
  const submit = async () => {
    setBusy(true);
    const r = await send('player:answers', { questions, answers });
    setBusy(false);
    setError(r.ok ? '' : r.error);
  };
  return (
    <section className="quiz" id="quiz" aria-label="Perguntas sobre a partida">
      <h2>📝 Agora pense sobre a sua partida</h2>
      <p className="muted">São 5 perguntas sobre o que você fez no leilão. Responda com as suas palavras, com pelo menos {ANSWER_MIN} letras em cada uma.</p>
      {questions.map((q, k) => {
        const len = answers[k].trim().length;
        return (
          <label key={k} className="q">
            <span className="q-text"><b>{k + 1}.</b> {q}</span>
            <TypedTextarea
              value={answers[k]}
              maxLength={ANSWER_MAX}
              rows={3}
              onChange={(e) => setAnswers((list) => list.map((a, j) => (j === k ? e.target.value : a)))}
              onBlocked={blocked}
            />
            <small className={len >= ANSWER_MIN ? 'ok' : ''}>{len >= ANSWER_MIN ? '✓' : `${len}/${ANSWER_MIN} letras no mínimo`}</small>
          </label>
        );
      })}
      {warn && <p className="bid-msg err" role="alert">{warn}</p>}
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn btn-primary btn-xl" disabled={busy || left > 0} onClick={submit}>
        {left ? `Faltam ${left} ${left === 1 ? 'resposta' : 'respostas'}` : busy ? 'Enviando…' : 'Enviar respostas'}
      </button>
    </section>
  );
}

// Painel do professor: quem já respondeu e o que respondeu.
export function AnswersPanel({ room, onClose }: { room: PublicRoom; onClose: () => void }) {
  const [answers, setAnswers] = useState<Record<string, AnswerSheet>>({});
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    send('teacher:answers', {}).then((r) => r.ok && setAnswers(r.answers));
  }, [room.answered.length]);
  return (
    <div className="overlay" role="dialog" aria-label="Respostas da turma">
      <div className="answers-card">
        <header>
          <h2>📝 Respostas: {room.answered.length} de {room.players.length}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">✕</button>
        </header>
        <ul>
          {room.players.map((p) => {
            const sheet = answers[p.id];
            return (
              <li key={p.id} style={{ '--c': p.color } as CSSProperties}>
                <button className="ans-row" disabled={!sheet} onClick={() => setOpen(open === p.id ? null : p.id)} aria-expanded={open === p.id}>
                  <Avatar color={p.color} size={30} />
                  <span>{p.name}</span>
                  <b>{sheet ? '✅ respondeu' : '⏳ respondendo…'}</b>
                </button>
                {sheet && open === p.id && (
                  <ol className="ans-list">
                    {sheet.questions.map((q, k) => (
                      <li key={k}>
                        <p className="q-text">{q}</p>
                        <p className="ans">{sheet.answers[k]}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
