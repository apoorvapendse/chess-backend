import {
  addToFirebaseToRoomMap,
  createGameInRedis,
  getBoardState,
  getRejoinersColor,
  getHostColor,
  redisRejoinHandler,
  setHostColor,
  setSecondPlayer,
  updateBoardState,
  getCurrentPlayerColor,
} from "../redis/redisFuncs.js";

export async function createGameHandler(
  socket,
  io,
  { firebaseID, newRoomID, playerEmail }
) {
  // join room and then let the creator socket know
  // about successful joining by emitting the id in the room;
  // rooms are created with host's roomID
  socket.join(newRoomID);
  io.to(newRoomID).emit("create-success", newRoomID);

  // creating game in redis
  await createGameInRedis(newRoomID, firebaseID);
  await addToFirebaseToRoomMap(firebaseID, newRoomID);
  console.log(playerEmail + " created room with id: " + newRoomID);
}

export async function getHostPieceColor(socket, { hostPieceColor, roomID }) {
  // storing hostColor in redis
  console.log(
    "host set his piece color to:",
    hostPieceColor,
    "for room:",
    roomID
  );
  await setHostColor(roomID, hostPieceColor);
  console.log("receive-host-color", hostPieceColor);
}

export async function joinGameHandler(
  socket,
  io,
  { firebaseID, playerEmail, inputRoomID }
) {
  let roomID = inputRoomID;
  const hostColor = await getHostColor(inputRoomID);

  if (hostColor) {
    socket.join(roomID);
    console.log(`${playerEmail} joined room:${roomID}`);

    // adding second player to redis
    await setSecondPlayer(inputRoomID, firebaseID);
    await addToFirebaseToRoomMap(firebaseID, roomID);

    // sending host-color to caller
    socket.emit("receive-host-color", hostColor);

    // sending join-success to host
    io.to(roomID).emit("join-success");
  } else {
    // TODO: handle this event on client side
    io.to(roomID).emit("host-piece-color-unselected");
  }
}

export async function updateBoardHandler(socket, { boardState, roomID }) {
  // saving boardstate in GlobalHashMap
  updateBoardState(roomID, boardState);

  // forward the boardState to other player
  socket.broadcast.to(roomID).emit("receive-updated-board", boardState);
}

export async function rejoinRequestHandler(
  socket,
  { firebaseID, prevRoomID, playerEmail }
) {
  // redisRejoinHandler will verify if the rejoin request is valid
  // by querying FirebaseToRoomMap
  let isValidRequest = redisRejoinHandler(firebaseID, prevRoomID);
  if (isValidRequest) {
    let rejoinersColor = await getRejoinersColor(prevRoomID, firebaseID);
    // to go from / to /board
    socket.join(prevRoomID);
    socket.emit("rejoin-success", rejoinersColor);

    //to set board state
    let currBoardState = await getBoardState(prevRoomID);
    let currentPlayerColor = await getCurrentPlayerColor(prevRoomID);

    console.log(currentPlayerColor);

    let isPlayersTurn = rejoinersColor === currentPlayerColor ? true : false;
    // now if playersTurn is true,means that boardState is according to
    // his orientation, else we have to rotate
    socket.emit("receive-rejoin-board", {
      currBoardState,
      isPlayersTurn,
    });
  }
}
