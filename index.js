import express from "express";
import router from "./Router/router.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { createGameInRedis, setHostColor } from "./redis/redisFuncs.js";

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

let hostColor = null;
let hostMail = null;

io.on("connection", (socket) => {
  console.log("new user connected:", socket.id);

  socket.on("create-game", async ({ playerEmail, uuid }) => {
    // join room and then let the creator socket know
    // about successful joining by emitting the id in the room;
    // rooms are created with host's uuid
    const roomID = uuid;
    socket.join(roomID);
    io.to(roomID).emit("create-success", roomID);
    // creating game in redis
    await createGameInRedis(uuid, playerEmail);
    console.log(playerEmail + "created room with id" + uuid);
  });

  socket.on("host-piece-color", async ({ hostPieceColor, uuid }) => {
    hostColor = hostPieceColor;
    // storing hostColor in redis
    await setHostColor(uuid, hostPieceColor);
    console.log("recieve-host-color", hostColor);
  });

  socket.on("join-game", ({ playerEmail, inputRoomID }) => {
    let roomID = inputRoomID;
    hostMail = roomID;

    if (hostColor) {
      socket.join(roomID);
      console.log(`${playerEmail} joined room:${roomID}`);
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

    socket.broadcast.to(hostMail).emit("recieve-updated-board", boardState);
  });
});

server.listen(PORT, () => console.log(`server is up at ${PORT}`));
