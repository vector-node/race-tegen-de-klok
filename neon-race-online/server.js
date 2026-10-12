const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const players = new Map();

io.on("connection", (socket) => {
  const color = ["#ff4d6d", "#42d6ff", "#ffe066", "#9bff7a", "#c69bff"][
    Math.floor(Math.random() * 5)
  ];

  players.set(socket.id, {
    id: socket.id,
    x: 0,
    z: 0,
    rotation: 0,
    color,
    name: "Racer-" + socket.id.slice(0, 4)
  });

  socket.emit("currentPlayers", Array.from(players.values()));
  socket.broadcast.emit("playerJoined", players.get(socket.id));

  socket.on("playerMove", (data) => {
    // Basic validation: only accept simple numeric position values.
    if (!data || ![data.x, data.z, data.rotation].every(Number.isFinite)) return;
    const player = players.get(socket.id);
    if (!player) return;
    player.x = Math.max(-200, Math.min(200, data.x));
    player.z = Math.max(-200, Math.min(200, data.z));
    player.rotation = data.rotation;
    socket.broadcast.emit("playerMoved", player);
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("playerLeft", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Neon Race draait op http://localhost:${PORT}`);
});
