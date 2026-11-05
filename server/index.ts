// Servidor de tempo real (Render). Só troca mensagens; imagens e sons ficam no GitHub Pages.
import express from 'express';
import { createServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import type { ClientEvents, ServerEvents } from '../shared/protocol.ts';
import { Game, GameError, type Room } from './game.ts';

type Auth = { code: string; kind: 'teacher' } | { code: string; kind: 'player'; playerId: string };
type Sock = Socket<ClientEvents, ServerEvents, Record<string, never>, { auth?: Auth }>;

export function createGameServer(origins: string[]) {
  const app = express();
  app.disable('x-powered-by');
  const http = createServer(app);
  const io = new Server<ClientEvents, ServerEvents, Record<string, never>, { auth?: Auth }>(http, {
    cors: { origin: origins, methods: ['GET', 'POST'] },
    allowRequest: (req, cb) => cb(null, !req.headers.origin || origins.includes(req.headers.origin)),
    maxHttpBufferSize: 16_384, // respostas finais: 5 × até 600 letras
    perMessageDeflate: false,
    serveClient: false,
  });

  // Várias mudanças no mesmo instante viram um único envio de estado.
  const pending = new Set<string>();
  const game = new Game({
    // Só para teste local: SECRET_SHARE=1 deixa todos os itens com lance secreto.
    secretShare: process.env.SECRET_SHARE ? Number(process.env.SECRET_SHARE) : undefined,
    onChange: (room) => {
      if (pending.has(room.code)) return;
      pending.add(room.code);
      queueMicrotask(() => {
        pending.delete(room.code);
        if (game.rooms.has(room.code)) io.to(room.code).emit('state', game.view(room));
      });
    },
    onBid: (room, bid) => io.to(room.code).emit('bid', { bid, serverNow: Date.now() }),
  });
  setInterval(() => game.cleanup(), 15 * 60_000).unref();

  app.get('/health', (_req, res) => {
    res.set('Access-Control-Allow-Origin', '*').json({ ok: true, rooms: game.rooms.size });
  });

  const handle = <T extends object>(ack: unknown, fn: () => T) => {
    if (typeof ack !== 'function') return;
    try {
      ack({ ok: true, ...fn() });
    } catch (err) {
      ack({ ok: false, error: err instanceof GameError ? err.message : 'Erro inesperado. Tente de novo.' });
      if (!(err instanceof GameError)) console.error(err);
    }
  };

  const attach = (socket: Sock, room: Room, auth: Auth) => {
    socket.data.auth = auth;
    socket.join(room.code);
    socket.emit('state', game.view(room));
    if (auth.kind === 'player') socket.emit('mission', { missionId: game.missionOf(room, auth.playerId) });
  };
  const playerSockets = (room: Room) =>
    [...io.sockets.sockets.values()].filter((s) => {
      const a = (s as Sock).data.auth;
      return a?.kind === 'player' && a.code === room.code;
    }) as Sock[];

  io.on('connection', (socket: Sock) => {
    const authed = () => {
      const auth = socket.data.auth ?? (() => { throw new GameError('Entre em uma sala primeiro.'); })();
      return { auth, room: game.room(auth.code) };
    };
    const teacherRoom = () => {
      const { auth, room } = authed();
      if (auth.kind !== 'teacher') throw new GameError('Só o professor pode fazer isso.');
      return room;
    };

    socket.on('teacher:create', (p, ack) =>
      handle(ack, () => {
        const room = game.createRoom(p);
        attach(socket, room, { code: room.code, kind: 'teacher' });
        return { code: room.code, token: room.teacherToken };
      }));

    // Nova partida na mesma sala: os alunos continuam conectados e recebem a missão nova.
    socket.on('teacher:restart', (p, ack) =>
      handle(ack, () => {
        const room = teacherRoom();
        game.restart(room, p);
        for (const s of playerSockets(room)) {
          const a = s.data.auth as { playerId: string };
          s.emit('mission', { missionId: game.missionOf(room, a.playerId) });
        }
        return {};
      }));

    socket.on('teacher:answers', (_p, ack) =>
      handle(ack, () => ({ answers: Object.fromEntries(teacherRoom().answers) })));

    socket.on('teacher:resume', (p, ack) =>
      handle(ack, () => {
        const room = game.teacher(p?.code, p?.token);
        attach(socket, room, { code: room.code, kind: 'teacher' });
        return {};
      }));

    socket.on('teacher:action', (p, ack) =>
      handle(ack, () => {
        const room = teacherRoom();
        switch (p?.action) {
          case 'start': game.start(room); break;
          case 'pause': game.setPaused(room, true); break;
          case 'resume': game.setPaused(room, false); break;
          case 'close': game.closeNow(room); break;
          case 'end': game.finish(room, 'teacher'); break;
          case 'reveal': game.reveal(room); break;
          case 'kick': {
            const kicked = game.kick(room, p.playerId);
            for (const s of playerSockets(room))
              if ((s.data.auth as { playerId: string }).playerId === kicked.id) {
                s.emit('kicked');
                s.leave(room.code);
                s.data.auth = undefined;
              }
            break;
          }
          default: throw new GameError('Ação desconhecida.');
        }
        return {};
      }));

    socket.on('player:join', (p, ack) =>
      handle(ack, () => {
        const { room, player } = game.join(p?.code, p?.name);
        attach(socket, room, { code: room.code, kind: 'player', playerId: player.id });
        return { playerId: player.id, token: player.token };
      }));

    socket.on('player:resume', (p, ack) =>
      handle(ack, () => {
        const { room, player, secretBid } = game.resume(p?.code, p?.token);
        attach(socket, room, { code: room.code, kind: 'player', playerId: player.id });
        game.setOnline(room, player.id, true);
        return { playerId: player.id, secretBid };
      }));

    socket.on('player:bid', (p, ack) =>
      handle(ack, () => {
        const { auth, room } = authed();
        if (auth.kind !== 'player') throw new GameError('Só alunos dão lances.');
        game.bid(room, auth.playerId, p?.amount);
        return {};
      }));

    socket.on('player:answers', (p, ack) =>
      handle(ack, () => {
        const { auth, room } = authed();
        if (auth.kind !== 'player') throw new GameError('Só alunos respondem.');
        game.submitAnswers(room, auth.playerId, p);
        return {};
      }));

    socket.on('disconnect', () => {
      const auth = socket.data.auth;
      if (auth?.kind !== 'player') return;
      const room = game.rooms.get(auth.code);
      // Outra aba do mesmo aluno ainda conectada? Então continua online.
      const still = [...io.sockets.sockets.values()].some(
        (s) => s.id !== socket.id && (s as Sock).data.auth?.kind === 'player' && ((s as Sock).data.auth as { playerId: string }).playerId === auth.playerId);
      if (room && !still) game.setOnline(room, auth.playerId, false);
    });
  });

  return { app, http, io, game };
}

if (import.meta.main) {
  const origins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((s) => s.trim());
  const port = Number(process.env.PORT ?? 3000);
  createGameServer(origins).http.listen(port, () => console.log(`LeilãoTEC servidor na porta ${port} — origens: ${origins.join(', ')}`));
}
