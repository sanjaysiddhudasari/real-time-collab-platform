const { Server } = require("socket.io");

const initSocket = (httpServer) => {

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  return io;
};

module.exports = initSocket;