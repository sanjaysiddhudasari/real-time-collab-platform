const { Server } = require("socket.io");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");

const initSocket = (httpServer) => {

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    const token = cookies?.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
    console.log("Token from cookies:", token);
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.userId = decoded.userId;
      console.log("Decoded user ID:", socket.userId);
      next();
    });
  })

  return io;
};

module.exports = initSocket;