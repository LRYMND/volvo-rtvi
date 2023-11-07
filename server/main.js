import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

server.listen(3001, () => {
  console.log("Server running on port 3001");
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);

  io.emit("BACKEND_MESSAGE", "Message from Backend")

  socket.on("SEND_MESSAGE", (data) => {
    io.emit("MESSAGE", data);
  });

  socket.on("FRONTEND_MESSAGE", (data) => {

    io.emit("BACKEND_MESSAGE", "Message from Backend")
  });
});