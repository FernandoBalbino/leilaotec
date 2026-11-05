// Alunos falsos para testar a TV com a turma cheia (use só localmente).
// Uso: node scripts/bots.ts <CODIGO> [quantidade] [url-do-servidor]
import { io } from 'socket.io-client';
import { minBid, type PublicRoom } from '../shared/protocol.ts';

const [code, count = '30', url = 'http://localhost:3000'] = process.argv.slice(2);
const names = 'Ana Bruno Caio Duda Enzo Fabi Gabi Heitor Iara João Kauã Lara Miguel Nina Otávio Pietra Quésia Rafa Sofia Théo Ulisses Vitória Wesley Xuxa Yasmin Zeca Lívia Davi Malu Igor'.split(' ');
for (let k = 0; k < Number(count); k++) {
  const s = io(url, { transports: ['websocket'], extraHeaders: { origin: 'http://localhost:5173' } });
  let room: PublicRoom | null = null;
  let me = '';
  s.on('state', (r) => (room = r));
  s.on('bid', ({ bid }) => room?.lot && room.lot.bids.push(bid));
  s.emit('player:join', { code, name: names[k % names.length] }, (r: { ok: boolean; playerId?: string }) => (me = r.playerId ?? ''));
  setInterval(() => {
    const lot = room?.lot;
    const p = room?.players.find((x) => x.id === me);
    if (!room || room.phase !== 'bidding' || !lot || !p || Math.random() > 0.08) return;
    if (lot.secret && lot.bids.some((b) => b.playerId === me)) return;
    const amount = minBid(lot) + (lot.secret ? Math.floor(Math.random() * 30) * 10 : Math.floor(Math.random() * 3) * 10);
    if (amount <= p.balance && lot.bids.at(-1)?.playerId !== me) s.emit('player:bid', { amount }, () => {});
  }, 400 + Math.random() * 400);
}
console.log(`${count} bots na sala ${code}`);
