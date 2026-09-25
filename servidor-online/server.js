// Servidor de salas do AUTOMATON (multiplayer cooperativo).
// Ele NÃO roda a fábrica: só liga os jogadores. O jogo do anfitrião é quem manda no mundo;
// o servidor repassa as mensagens entre o anfitrião e os convidados de cada sala.
//
// Rodar no seu PC:   npm install && npm start        (porta 8787, ou a variável PORT)
// Na nuvem (Render): veja o render.yaml na raiz do projeto e o README.
import http from 'node:http';
import { WebSocketServer } from 'ws';

const PORT = +process.env.PORT || 8787;
const MAX_PLAYERS = 4;
const MAX_MSG = 8 * 1024 * 1024; // a fábrica inteira vai numa mensagem só quando alguém entra
const rooms = new Map(); // código -> { host, guests: Map(id -> ws) }
let nextId = 1;

const server = http.createServer((req, res) => {
  // página de saúde (o Render usa pra saber se está vivo)
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(`AUTOMATON multiplayer ok · ${rooms.size} sala(s)\n`);
});
const wss = new WebSocketServer({ server, maxPayload: MAX_MSG });

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O/0 e I/1 pra não confundir
function newCode() {
  for (;;) {
    let c = '';
    for (let i = 0; i < 5; i++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (!rooms.has(c)) return c;
  }
}
const send = (ws, obj) => { if (ws && ws.readyState === 1) ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj)); };
const members = (room) => [room.host, ...room.guests.values()];
const cleanName = (n) => String(n || 'Jogador(a)').replace(/[<>"'`&]/g, '').slice(0, 24) || 'Jogador(a)';

wss.on('connection', (ws) => {
  ws.id = nextId++;
  ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw.toString()); } catch { return; }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'host' && !ws.room) {
      const code = newCode();
      ws.room = code; ws.name = cleanName(m.name); ws.isHost = true;
      rooms.set(code, { host: ws, guests: new Map() });
      send(ws, { t: 'room', code, id: ws.id });
      return;
    }
    if (m.t === 'join' && !ws.room) {
      const code = String(m.code || '').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) return send(ws, { t: 'error', msg: 'Sala não encontrada. Confira o código (5 letras).' });
      if (room.guests.size + 1 >= MAX_PLAYERS) return send(ws, { t: 'error', msg: `A sala está cheia (máximo ${MAX_PLAYERS} jogadores).` });
      ws.room = code; ws.name = cleanName(m.name);
      room.guests.set(ws.id, ws);
      send(ws, { t: 'joined', code, id: ws.id, host: { id: room.host.id, name: room.host.name }, players: members(room).map((p) => ({ id: p.id, name: p.name })) });
      for (const p of members(room)) if (p !== ws) send(p, { t: 'peer', id: ws.id, name: ws.name, join: true });
      return;
    }
    if (m.t === 'to' && ws.room) {
      const room = rooms.get(ws.room);
      if (!room) return;
      const out = JSON.stringify({ t: 'msg', from: ws.id, m: m.m });
      if (m.to === 'host') send(room.host, out);
      else if (m.to === 'all') { for (const p of members(room)) if (p !== ws) send(p, out); }
      else {
        const p = room.guests.get(m.to) || (room.host.id === m.to ? room.host : null);
        if (p) send(p, out);
      }
    }
  });
  ws.on('close', () => {
    const room = ws.room && rooms.get(ws.room);
    if (!room) return;
    if (ws.isHost) {
      for (const g of room.guests.values()) { send(g, { t: 'closed', msg: 'O anfitrião saiu. A sala fechou.' }); g.close(); }
      rooms.delete(ws.room);
    } else {
      room.guests.delete(ws.id);
      for (const p of members(room)) send(p, { t: 'peer', id: ws.id, name: ws.name, leave: true });
    }
  });
});

// derruba conexões mortas (Wi-Fi caiu, aba fechada sem avisar)
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.alive) { ws.terminate(); continue; }
    ws.alive = false;
    ws.ping();
  }
}, 25000);

server.listen(PORT, () => console.log(`AUTOMATON multiplayer ouvindo na porta ${PORT}`));
