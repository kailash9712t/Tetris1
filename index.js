import express from 'express';
import route from './src/Routes/routes.js';
import 'dotenv/config';
import socketConnection from './src/Socket/socket.js';
import http from 'http';
import { Server } from 'socket.io';


const app = express();
const port = process.env.PORT || 8080;

const server = http.createServer(app);

const io = new Server(server, {
    cors : {
        origin : "*",
        method : ["GET","POST"]
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user",route);

socketConnection(io);

 
server.listen(port,() => {
    console.log(`web url :- http://localhost:${port}`);
})  