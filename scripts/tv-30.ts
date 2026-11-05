// Teste visual da TV com 30 alunos-robô (só local). Uso: node scripts/tv-30.ts
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const b = await chromium.launch({ channel: 'chrome' });
const tv = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
tv.on('dialog', (d) => d.accept());
await tv.goto('http://localhost:5173/leilaotec/');
await tv.getByText('servidor online').waitFor();
await tv.getByRole('button', { name: /Sou professor/ }).click();
await tv.getByRole('button', { name: 'Criar sala' }).click();
const code = (await tv.locator('.code').getAttribute('aria-label'))!.replace('Código ', '');
const bots = spawn(process.execPath, ['scripts/bots.ts', code, '30'], { stdio: 'inherit' });
await tv.getByText('30 alunos entraram').waitFor({ timeout: 20000 });
await tv.screenshot({ path: 'qa-evidence/30-lobby.png' });
await tv.getByRole('button', { name: /Começar o leilão/ }).click();
await tv.locator('.countdown').waitFor({ timeout: 20000 });
await tv.waitForTimeout(15000);
await tv.screenshot({ path: 'qa-evidence/30-lances.png' });
await tv.getByRole('button', { name: 'Encerrar lances' }).click();
await tv.waitForTimeout(2500);
await tv.screenshot({ path: 'qa-evidence/30-resultado.png' });
for (let k = 0; k < 3; k++) {
  await tv.locator('.countdown').waitFor({ timeout: 30000 });
  await tv.waitForTimeout(6000);
  await tv.getByRole('button', { name: 'Encerrar lances' }).click();
  await tv.waitForTimeout(1000);
}
await tv.getByRole('button', { name: 'Encerrar partida' }).click();
await tv.locator('.final-intro').waitFor();
for (let k = 0; k < 30; k++) await tv.keyboard.press('ArrowRight');
await tv.waitForTimeout(4500);
await tv.screenshot({ path: 'qa-evidence/30-slide.png' });
await tv.keyboard.press('ArrowRight');
await tv.keyboard.press('ArrowRight');
await tv.waitForTimeout(2500);
await tv.screenshot({ path: 'qa-evidence/30-podio.png' });
bots.kill();
await b.close();
