import express from 'express';
import route from './src/Routes/routes.js';
import 'dotenv/config';
import socketConnection from './src/Socket/socket.js';
import http from 'http';
import { Server } from 'socket.io';
import * as Sentry from '@sentry/node';


Sentry.init({
  dsn: "https://05d84bbb06430eeeceba9744d18e4f7f@o4509473535557632.ingest.us.sentry.io/4509473629601792",

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

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

Sentry.setupExpressErrorHandler(app);

 
server.listen(port,() => {
    console.log(`web url :- http://localhost:${port}`);
})  