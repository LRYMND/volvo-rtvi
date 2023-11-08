import express from "express";
import path from "path";
import pageRouter from "./pageRouter.js";
import assetsRouter from "./assetsRouter.js";
import { Server } from "socket.io";
import { createServer } from "http";

const port = process.env.PORT || 3001;
const publicPath = path.join(path.resolve(), "public");
const distPath = path.join(path.resolve(), "dist");

const app = express();
const server = createServer(app);

app.get("/api/v1/hello", (_req, res) => {
    res.json({ message: "Hello, world!" });
});

if (process.env.NODE_ENV === "production") {
    app.use("/", express.static(distPath));
  } else {
    app.use("/", express.static(publicPath));
    app.use("/src", assetsRouter);
  }


app.use(pageRouter);

app.listen(port, () => {
    console.log("Server listening on port", port);
});


const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });


io.on("connection", (socket) => {
    console.log(socket.id);
  
    io.emit("BACKEND_MESSAGE", "Message from Backend")
  
    socket.on("SEND_MESSAGE", (data) => {
      io.emit("MESSAGE", data);
    });
  
    socket.on("FRONTEND_MESSAGE", (data) => {
  
      io.emit("BACKEND_MESSAGE", "Message from Backend")
    });
  });