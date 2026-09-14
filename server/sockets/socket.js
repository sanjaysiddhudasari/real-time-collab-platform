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
    // ponytail: cookie-only auth; browser sends it automatically via withCredentials
    const header = socket.handshake.headers.cookie || "";
    const cookieToken = header.split(";").reduce((found, part) => {
      const idx = part.indexOf("=");
      if (idx < 0) return found;
      const key = part.slice(0, idx).trim();
      if (key !== "jwt") return found;
      try {
        return decodeURIComponent(part.slice(idx + 1).trim());
      } catch {
        return part.slice(idx + 1).trim();
      }
    }, null);
    if (!cookieToken) {
      return next(new Error("Authentication error"));
    }
    jwt.verify(cookieToken, process.env.JWT_SECRET, (err, decoded) => {
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