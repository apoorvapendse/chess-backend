import express from "express";
import router from "./Router/router.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import {
  addToFirebaseToRoomMap,
  createGameInRedis,
  getBoardState,
  getCurrentPlayerColor,
  getHostColor,
  redisRejoinHandler,
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

  socket.on("create-game", async ({ firebaseID, newRoomID, playerEmail }) => {
    // join room and then let the creator socket know
    // about successful joining by emitting the id in the room;
    // rooms are created with host's roomID
    socket.join(newRoomID);
    io.to(newRoomID).emit("create-success", newRoomID);

    // creating game in redis
    await createGameInRedis(newRoomID, firebaseID);
    await addToFirebaseToRoomMap(firebaseID,newRoomID);
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

  socket.on("join-game", async ({ firebaseID, playerEmail, inputRoomID }) => {
    let roomID = inputRoomID;
    const hostColor = await getHostColor(inputRoomID);

    if (hostColor) {
      socket.join(roomID);
      console.log(`${playerEmail} joined room:${roomID}`);

      // adding second player to redis
      await setSecondPlayer(inputRoomID, firebaseID);
      await addToFirebaseToRoomMap(firebaseID,roomID);
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


  // Todo: make event handler for reconnecting when the user clicks on the rejoin button from client side
  
  socket.on("rejoin-request",async ({firebaseID,prevRoomID,playerEmail})=>{
    let isValidRequest =  redisRejoinHandler(firebaseID,prevRoomID)
    if(isValidRequest){
      let rejoinersColor = await getCurrentPlayerColor(prevRoomID,firebaseID);
      console.log("rejoiner's color:",rejoinersColor)
    }
  })
});

server.listen(PORT, () => console.log(`server is up at ${PORT}`));
