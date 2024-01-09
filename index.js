import express from "express";
import router from "./Router/router.js";
import { createServer } from "node:http";
import { Server } from "socket.io";

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

const PORT = 4000;

app.use("/", router);

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

  socket.on("join-game", (data) => {
    let roomID = data?.inputRoomID;
    socket.join(roomID);
    console.log(`${data.playerEmail} joined room:${roomID}`);
    io.to(roomID).emit("join-success");
  });

  socket.on("host-piece-color", (hostColor) => {
    console.log(hostColor);
  });
});

server.listen(PORT, () => console.log(`server is up at ${PORT}`));
