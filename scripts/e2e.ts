// Partida rápida de ponta a ponta: professor + alunos, um item, fim e apresentação.
// Uso: node scripts/e2e.ts            (local: http://localhost:5173/leilaotec/)
//      E2E_URL=https://... ALUNOS=1 node scripts/e2e.ts   (teste leve em produção)
import { chromium, type Page } from 'playwright';
import { mkdirSync } from 'node:fs';

const URL = process.env.E2E_URL ?? 'http://localhost:5173/leilaotec/';
const STUDENTS = Number(process.env.ALUNOS ?? 2);
const OUT = 'qa-evidence';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? 'chrome' }); // CI usa PW_CHANNEL=chromium
const errors: string[] = [];
const open = async (w: number, h: number) => {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/sounds\/|Failed to load resource/.test(m.text()) && errors.push(m.text()));
  page.on('dialog', (d) => d.accept());
  // Registra cada som tocado (para conferir no fim).
  await page.addInitScript(() => {
    const w = window as unknown as { played: string[] };
    w.played = [];
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      w.played.push(this.currentSrc || this.src);
      return orig.call(this);
    };
  });
  return page;
};
const shot = (p: Page, name: string) => p.screenshot({ path: `${OUT}/${name}.png` });
const step = (msg: string) => console.log('•', msg);

try {
  const tv = await open(1366, 768);
  await tv.goto(URL);
  await tv.getByText('servidor online').waitFor({ timeout: 90_000 }); // Render pode estar dormindo
  await tv.getByRole('button', { name: /Sou professor/ }).click();
  await tv.waitForTimeout(600);
  await shot(tv, '00-criar-sala');
  await tv.getByRole('button', { name: 'Criar sala' }).click();
  const code = (await tv.locator('.code').getAttribute('aria-label'))!.replace('Código ', '');
  step(`sala ${code}`);

  const kids: Page[] = [];
  for (let k = 0; k < STUDENTS; k++) {
    const p = await open(1366, 768);
    await p.goto(`${URL}?sala=${code}`);
    await p.getByPlaceholder('Como a turma te chama').fill(['Ana', 'Bruno', 'Caio'][k] ?? `Aluno ${k}`);
    await p.getByRole('button', { name: 'Entrar' }).click();
    await p.getByText(/Você entrou/).waitFor();
    kids.push(p);
  }
  await tv.getByText(`${STUDENTS} ${STUDENTS === 1 ? 'aluno entrou' : 'alunos entraram'}`).waitFor();
  await shot(tv, '01-lobby-tv');
  await shot(kids[0], '02-lobby-aluno');

  await tv.getByRole('button', { name: /Começar o leilão/ }).click();
  await tv.locator('.wheel-disc').waitFor();
  await tv.waitForTimeout(2500);
  await shot(tv, '03-roleta-tv');
  await tv.waitForTimeout(5200);
  await shot(tv, '04-item-grande-tv');
  await kids[0].locator('.countdown').waitFor({ timeout: 15_000 });
  step('lances abertos');

  const secret = await kids[0].locator('.bid-box.secret').count();
  for (const [k, p] of kids.entries()) {
    if (secret) {
      const min = Number((await p.locator('.custom input').getAttribute('min')) ?? 0);
      await p.locator('.custom input').fill(String(min + 50 * (k + 1)));
      await p.getByRole('button', { name: 'Enviar lance secreto' }).click();
      await p.getByRole('button', { name: /Confirmar/ }).click();
    } else {
      await p.locator('.btn-quick').first().click();
    }
    await p.locator(secret ? '.bid-box.sent' : '.bid-msg.ok').waitFor();
    await tv.waitForTimeout(300);
  }
  step(secret ? 'lances secretos enviados' : 'lances abertos enviados');
  await shot(tv, '05-lances-tv');
  await shot(kids[0], '06-lances-aluno');

  if (!(await tv.locator('.overlay').count())) await tv.getByRole('button', { name: 'Encerrar lances' }).click();
  await tv.locator('.result-card').waitFor();
  await tv.waitForTimeout(secret ? 2600 : 800);
  await shot(tv, '07-vendido-tv');
  const played = await tv.evaluate(() => (window as unknown as { played: string[] }).played.join(' '));
  for (const s of ['roleta', 'item', 'lance']) if (!played.includes(`sounds/${s}.mp3`)) errors.push(`som ${s} não tocou na TV`);
  step('sons na TV: ' + [...new Set(played.match(/\w+(?=\.mp3)/g))].join(', '));
  const winner = await tv.locator('.sold-who strong').textContent();
  step(`vencedor: ${winner}`);

  await tv.getByRole('button', { name: 'Encerrar partida' }).click();
  await tv.locator('.final-intro').waitFor();
  await kids[0].getByText('Olhe para a TV!').waitFor();
  await shot(kids[0], '08-aluno-espera-tv');
  await tv.keyboard.press('ArrowRight');
  await tv.locator('.slide').waitFor();
  await tv.waitForTimeout(4500);
  await shot(tv, '09-slide-aluno-tv');
  for (let k = 0; k < STUDENTS + 1; k++) await tv.keyboard.press('ArrowRight');
  await tv.locator('.final-podium').waitFor();
  await tv.waitForTimeout(1500);
  await shot(tv, '10-podio-tv');
  await tv.getByRole('button', { name: 'Mostrar resultado para a turma' }).click();
  await kids[0].locator('.student-final').waitFor();
  await kids[0].waitForTimeout(3500);
  await shot(kids[0], '11-resultado-aluno');

  // Perguntas finais: colar fica bloqueado; cada aluno responde as 5.
  const box = kids[0].locator('.quiz textarea').first();
  await box.focus();
  await box.evaluate((el) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', 'texto colado de outro lugar');
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  if ((await box.inputValue()) !== '') errors.push('colar não foi bloqueado');
  await kids[0].getByText('Colar está desativado').waitFor();
  const questions = await kids[0].locator('.q-text').allTextContents();
  step(`pergunta 1 do aluno: ${questions[0]}`);
  for (const p of kids) {
    for (const t of await p.locator('.quiz textarea').all()) await t.pressSequentially('Sem fonte o PC não liga, então ela vem antes.', { delay: 2 });
    await p.getByRole('button', { name: 'Enviar respostas' }).click();
    await p.getByText('Respostas enviadas!').waitFor();
  }
  await tv.getByRole('button', { name: `📝 Respostas: ${STUDENTS} de ${STUDENTS}` }).click();
  await tv.locator('.ans-row').first().click();
  await tv.locator('.ans').first().waitFor();
  await shot(tv, '12-respostas-tv');
  await tv.getByRole('button', { name: 'Fechar' }).click();
  step('respostas ok');

  // Nova partida na mesma sala, no modo missão.
  await tv.getByRole('button', { name: 'Nova partida' }).click();
  await tv.getByRole('button', { name: /Missão do cliente/ }).click();
  await tv.getByRole('button', { name: 'Abrir nova partida' }).click();
  await kids[0].locator('.mission-big').waitFor();
  await kids[0].waitForTimeout(800); // fim da animação de entrada
  const mission = await kids[0].locator('.mission h2').textContent();
  step(`missão do aluno 1: ${mission}`);
  await shot(kids[0], '13-missao-aluno');
  await tv.getByRole('button', { name: /Começar o leilão/ }).click();
  await kids[0].locator('.countdown').waitFor({ timeout: 15_000 });
  await shot(kids[0], '14-lances-com-missao');
  await tv.getByRole('button', { name: 'Encerrar partida' }).click();
  await tv.locator('.final-intro').waitFor();
  await tv.keyboard.press('ArrowRight');
  await tv.locator('.slide .mission').waitFor();
  await tv.waitForTimeout(5000);
  await shot(tv, '15-slide-missao-tv');
  step('modo missão ok');
  step('fim ok');
  if (errors.length) throw new Error('Erros no console:\n' + errors.join('\n'));
} finally {
  await browser.close();
}
