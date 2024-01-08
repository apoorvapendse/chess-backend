import express from "express";
import router from "./Router/router.js";
import {createServer} from 'node:http'; 
import {Server} from 'socket.io'
import { v4 as uuidv4 } from 'uuid';


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
const io = new Server(server,{cors:{origin:"http://localhost:3000"}});

const PORT = 4000;

app.use("/", router);

io.on("connection",(socket)=>{
    console.log("new user connected:",socket.id);
        
        socket.on("create-game",(data)=>{
        //    join room and then let the creator socket know 
        //    about successful joining by emitting the id in the room;
        console.log(data.playerEmail)
            const roomID = uuidv4();
            console.log("new room id:",roomID);
            socket.join(roomID)
            io.to(roomID).emit("create-success",roomID)
        })
        socket.on('join-game',(data)=>{

            let roomID = data?.inputRoomID
            socket.join(roomID);
            console.log(`${data.playerEmail} joined room:${roomID}`);
            io.to(roomID).emit("join-success")
        })

})


server.listen(PORT, () => console.log(`server is up at ${PORT}`));
