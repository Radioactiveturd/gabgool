const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server);

// rooms: { [roomCode]: { mobIndex: number, players: Map(socketId -> player) } }
const rooms = new Map();
const socketRoom = new Map();

function ensureRoom(code) {
  if (!rooms.has(code)) {
    // mobIndex is a room seed; clients will map it into the mobs array
    rooms.set(code, { mobIndex: Math.floor(Math.random() * 1000), players: new Map() });
  }
  return rooms.get(code);
}

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }) => {
    if (!room) return;
    socket.join(room);
    socketRoom.set(socket.id, room);
    const r = ensureRoom(room);
    r.players.set(socket.id, { id: socket.id, name: name || `P${socket.id.slice(0,4)}`, score: 0, wrongCount: 0 });
    io.to(room).emit('roomState', { players: Array.from(r.players.values()), mobIndex: r.mobIndex });
  });

  socket.on('guess', ({ correct }) => {
    const room = socketRoom.get(socket.id);
    if (!room) return;
    const r = rooms.get(room);
    const p = r.players.get(socket.id);
    if (!p) return;
    if (correct) p.score += 1;
    else p.wrongCount += 1;
    r.players.set(socket.id, p);
    // if correct, advance to a new mob for the room
    if (correct) {
      r.mobIndex = Math.floor(Math.random() * 1000000);
      io.to(room).emit('newMob', { mobIndex: r.mobIndex });
    }
    io.to(room).emit('roomState', { players: Array.from(r.players.values()), mobIndex: r.mobIndex });
  });

  socket.on('next', () => {
    const room = socketRoom.get(socket.id);
    if (!room) return;
    const r = rooms.get(room);
    r.mobIndex = Math.floor(Math.random() * 1000000);
    io.to(room).emit('newMob', { mobIndex: r.mobIndex });
    io.to(room).emit('roomState', { players: Array.from(r.players.values()), mobIndex: r.mobIndex });
  });

  socket.on('disconnect', () => {
    const room = socketRoom.get(socket.id);
    if (!room) return;
    const r = rooms.get(room);
    if (r) {
      r.players.delete(socket.id);
      io.to(room).emit('roomState', { players: Array.from(r.players.values()), mobIndex: r.mobIndex });
      if (r.players.size === 0) rooms.delete(room);
    }
    socketRoom.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
