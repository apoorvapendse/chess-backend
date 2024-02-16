import express from "express";
import router from "./Router/router.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import socketEvents from "./Sockets/socket.js";

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
const io = new Server(server, { cors: { origin: "https://aprt-chess-frontend.onrender.com/" } });

const PORT = 4000;

app.use("/", router);

io.on("connection", (socket) => socketEvents(socket, io));

server.listen(PORT, () => console.log(`server is up at ${PORT}`));
