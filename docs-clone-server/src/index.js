import cors from "cors";
import express from "express";
import http from 'http'
import {Server} from 'socket.io'

const app = express().use(
  cors({
    origin: "http://localhost:3000",
  })
);

const HTTP = http.Server(app);
const io = new Server(HTTP);

io.on('connection', (socket) => {
  socket.on('new-operations', function(data) {
    io.emit('new-remote-operations', data)
  })
  console.log('a user connected');
});

HTTP.listen(4000, () => {
  console.log('listening on *:4000');
});