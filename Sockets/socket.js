import {
  createGameHandler,
  getHostPieceColor,
  joinGameHandler,
  rejoinRequestHandler,
  updateBoardHandler,
} from "./eventHandlers.js";

export default function socketEvents(socket, io) {
  console.log("new user connected:", socket.id);

  socket.on("create-game", (data) => createGameHandler(socket, io, data));

  socket.on("host-piece-color", (data) => getHostPieceColor(socket, data));

  socket.on("join-game", (data) => joinGameHandler(socket, io, data));

  socket.on("update-board", (data) => updateBoardHandler(socket, data));

  // Todo: make event handler for reconnecting
  // when the user clicks on the rejoin button from client side
  socket.on("rejoin-request", (data) => rejoinRequestHandler(socket, data));
}
