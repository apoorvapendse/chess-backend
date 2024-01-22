import express from "express";
import router from "./Router/router.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  createGameInRedis,
  getHostColor,
  setHostColor,
  setSecondPlayer,
  updateBoardState,
} from "./redis/redisFuncs.js";

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

  socket.on("create-game", async ({ playerEmail, newRoomID }) => {
    // join room and then let the creator socket know
    // about successful joining by emitting the id in the room;
    // rooms are created with host's roomID
    socket.join(newRoomID);
    io.to(newRoomID).emit("create-success", newRoomID);

    // creating game in redis
    await createGameInRedis(newRoomID, playerEmail);
    console.log(playerEmail + " created room with id: " + newRoomID);
  });

  socket.on("host-piece-color", async ({ hostPieceColor, roomID }) => {
    // storing hostColor in redis
    console.log(
      "host set his piece color to:",
      hostPieceColor,
      "for room:",
      roomID
    );
    await setHostColor(roomID, hostPieceColor);
    console.log("recieve-host-color", hostPieceColor);
  });

  socket.on("join-game", async ({ playerEmail, inputRoomID }) => {
    let roomID = inputRoomID;
    const hostColor = await getHostColor(inputRoomID);

    if (hostColor) {
      socket.join(roomID);
      console.log(`${playerEmail} joined room:${roomID}`);

      // adding second player to redis
      setSecondPlayer(inputRoomID, playerEmail);

      // sending host-color to caller
      socket.emit("recieve-host-color", hostColor);

      // sending join-success to host
      io.to(roomID).emit("join-success");
    } else {
      io.to(roomID).emit("host-piece-color-unselected");
    }
  });

  socket.on("update-board", ({ boardState, roomID }) => {
    // saving boardstate to redis or db
    updateBoardState(roomID, boardState);

    socket.broadcast.to(roomID).emit("recieve-updated-board", boardState);
  });

  // client disconnect
  socket.on("disconnect", () => {
    // TODO: Map socket id with email in redis for both players
    console.log(socket.id + " got disconnected");
  });
  // Todo: make event handler for reconnecting when the user clicks on the rejoin button from client side
});

server.listen(PORT, () => console.log(`server is up at ${PORT}`));
