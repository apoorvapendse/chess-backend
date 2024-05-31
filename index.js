import express from "express";
import router from "./Router/router.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import socketEvents from "./Sockets/socket.js";
import dotenv from "dotenv"

dotenv.config()

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] } }); // Add methods if needed

const PORT = process.env.PORT;

// Set up CORS headers for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.header("Access-Control-Allow-Methods", "GET, POST"); // Add methods if needed
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/", router);

io.on("connection", (socket) => socketEvents(socket, io));

server.listen(PORT, () => console.log(`server is up at ${PORT}`));
