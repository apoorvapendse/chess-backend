import {
  createGameHandler,
  getHostPieceColor,
  joinGameHandler,
  rejoinRequestHandler,
  updateBoardHandler,
} from "./eventHandlers";


export default function socketEvents(socket) {
    console.log("new user connected:", socket.id);
    
    socket.on("create-game", createGameHandler);
    
    socket.on("host-piece-color", getHostPieceColor);
    
    socket.on("join-game", joinGameHandler);
    
    socket.on("update-board", updateBoardHandler);
    
    // Todo: make event handler for reconnecting when the user clicks on the rejoin button from client side
    socket.on("rejoin-request", rejoinRequestHandler);
}
