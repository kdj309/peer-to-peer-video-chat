const { createServer } = require("node:http");
const express = require("express");
const { Server } = require("socket.io");
const app = express();
const cors = require("cors");
const server = createServer(app);
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.json());
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello World",
  });
});
const emailtoSocketIdMap = new Map();
const SocketIdToEmailMap = new Map();
io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);
  socket.on("user:join", ({ email, roomId }) => {
    emailtoSocketIdMap.set(email, socket.id);
    SocketIdToEmailMap.set(socket.id, email);
    io.to(roomId).emit("user:join", { from: socket.id, email });
    socket.join(roomId);
    io.to(socket.id).emit("room:join", { email, roomId });
  });
  socket.on("user:call", ({ from, to, offer }) => {
    console.log(`Call triggered from ${from} ,to ${to} and it contains ${offer}`)
    io.to(to).emit("incoming:call", { from: socket.id, offer, email: from })
  })
  socket.on("call:accepted", ({ to, ans }) => {
    console.log(`Call got accepted please acknowledge ${to} it contains ${ans}`);
    io.to(to).emit("call:accepted", { from: socket.id, ans })
  })
  socket.on("nego:needed", ({ to, offer }) => {
    console.log(`Negotiation Request to ${to} it contains ${offer}`)
    io.to(to).emit("nego:accept", { from: socket.id, offer })
  })
  socket.on("nego:final", ({ to, ans }) => {
    console.log(`Negotiation Final step to ${to} it contains ${ans}`)
    io.to(to).emit("nego:final", { from: socket.id, ans })
  })
  socket.on("user:hangup", ({ to }) => {
    console.log(`Hang-up request received from ${socket.id} to ${to}`);
    io.to(to).emit("user:hangup", { from: socket.id });
  });
  socket.on("user:disconnected", ({ to }) => {
    io.to(to).emit("user:disconnected", { from: socket.id })
  })
});


server.listen(3000, (err) => {
  if (err) {
    console.log("Some Error Occurred", err);
  }
  console.log("Server Started On 3000");
});
