import express from "express";
import router from "./Router/router.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createClient } from "redis";

// Block for some notes, collapse if not needed
{
  // in normal client-server http requests,
  // server can only communicate with client iff client sends some request to the server
  //web socket connection doesn't close like http and communication is bidirectional(full duplex)
}

const app = express();
// server will handle all the http requests
const server = createServer(app);
//io will handle all the socket connections
const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

// creating redis client
const redis = createClient();
redis.on("error", (err) => console.log("redis client error", err));
redis.connect();

const PORT = 4000;

app.use("/", router);

let hostColor = null;
let hostMail = null;

io.on("connection", (socket) => {
  console.log("new user connected:", socket.id);

  socket.on("create-game", (data) => {
    // join room and then let the creator socket know
    // about successful joining by emitting the id in the room;
    console.log(data.playerEmail);
    // joining room having name as the player's email
    const roomID = data.playerEmail;
    socket.join(roomID);
    io.to(roomID).emit("create-success", roomID);
  });

  socket.on("host-piece-color", (hostPieceColor) => {
    hostColor = hostPieceColor;
    console.log("recieve-host-color", hostColor);
  });

  socket.on("join-game", (data) => {
    let roomID = data?.inputRoomID;
    hostMail = roomID;
    if (hostColor) {
      socket.join(roomID);
      console.log(`${data.playerEmail} joined room:${roomID}`);
      // sending host-color to caller
      socket.emit("recieve-host-color", hostColor);
      // sending join-success to host
      io.to(roomID).emit("join-success");
    } else {
      io.to(roomID).emit("host-piece-color-unselected");
    }
  });

  socket.on("update-board", (boardState) => {
    // todo: save boardstate to redis or db

    // io.to(hostMail).emit("recieve-updated-board", boardState);
    // hostMail is the roomID;
    socket.broadcast.to(hostMail).emit("recieve-updated-board", boardState);
  });
});

server.listen(PORT, () => console.log(`server is up at ${PORT}`));
