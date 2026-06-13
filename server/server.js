const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const initSocket = require("./sockets/socket");
const cors = require('cors');
const runCode = require('./sockets/handlers/runCode')

const { createServer } = require("http");
const { Server } = require("socket.io");
const Room = require('./models/room.model')
const User = require('./models/user.model')
const Message = require('./models/message.model')

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/rooms.routes");
const messageRoutes = require('./routes/message.routes')
const connectDb = require("./db/connection");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
const httpServer = createServer(app);
const io = initSocket(httpServer);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);


  // room 

  socket.on("join-room", async ({ roomId }) => {
    const room = await Room.findOne({roomId:roomId});
    const isPresent = room.participants.find(u => u._id.toString() === socket.userId.toString());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    }
    socket.join(roomId);
    const userId = socket.userId.toString();
    const username = await User.findById(userId).then(u => u.username).catch(e => null);
    console.log(`${socket.id} joined room ${roomId}`);
    try {
      const room = await Room.findOne({ roomId: roomId }).populate([
        { path: "participants", select: "username" },
        { path: "messages", populate: { path: "sender", select: "username" } }
      ]);
      if (!room) {
        socket.emit("room-error", {
          message: "room not found"
        })
        return;
      }
      console.log(room);
      io.to(roomId).emit("room-data", room);
      console.log(socket.userId.toString(), userId);
      io.to(roomId).emit("user-joined", { username });
    } catch (error) {
      console.log(error);
      socket.emit("room-error", {
        message: "server error"
      })
    }
  });


  socket.on("leave-room", async ({ roomId }) => {
    const user = await User.findById(socket.userId.toString());
    if (!user) {
      socket.emit("room-error", { message: "server-error" });
      return;
    }
    const username = user.username;
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", { username, userId: socket.userId.toString() });
    try {
      const room = await Room.findOne({ roomId: roomId }).populate("participants", "username");
      if (!room) {
        socket.emit("room-error", {
          message: "server error "
        })
        return;
      }
      socket.to(roomId).emit("room-data", room);
    } catch (error) {
      console.log(error);
      socket.emit("room-error", { message: "server error " });
    }
  });

  socket.on("sync-code", async ({ roomId, code, fileId }) => {
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === socket.userId.toString());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    }
    const file = room.files.find(f => f._id.toString() === fileId.toString());
    if (file) {
      file.code = code;
      await room.save();
    } else {
      socket.emit("room-error", { message: "file not found" });
    }
    socket.to(roomId).emit("receive-code", { code, fileId });
  });

  socket.on("lang-change", async ({ roomId, lang, fileId }) => {
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === socket.userId.toString());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    }
    const file = room.files.find(f => f._id.toString() === fileId.toString());
    console.log({ roomId, lang, fileId });
    if (file) {
      file.lang = lang;
      await room.save();
    }
    io.to(roomId).emit("lang-change", { lang, fileId });
  })

  socket.on("run-code", async ({ roomId, fileId }) => {
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.error("room-error", { message: "room not found" });
      return;
    };
    const file = room.files.find(f => f && f._id.toString() === fileId.toString());
    if (!file) {
      socket.error("room-error", { message: " file not found " })
      return;
    }
    runCode({ code: file.code, lang: file.lang, roomId }, io);
    io.to(roomId).emit("run-start");
  })


  // cursor styles 

  socket.on("cursor-move", async ({ roomId, position }) => {
    const room = await Room.findOne({ roomId: roomId });
    const isPresent = room.participants.find(u => u._id.toString() === socket.userId.toString());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    }
    const username = await User.findById(socket.userId);
    socket.to(roomId).emit("cursor-move", { userId: socket.userId.toString(), username, position });
  });


  //messages

  socket.on("send-message", async ({ roomId, content }) => {
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("message-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === socket.userId.toString());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    };
    try {
      const user = await User.findById(socket.userId.toString());
      if (!user) {
        socket.emit("message-error", { message: "user not found" });
        return;
      }
      console.log({ roomId, userId: socket.userId.toString(), content });
      const message = await Message.create({
        roomId,
        sender: socket.userId.toString(),
        content: content
      });
      const room = await Room.findOne({ roomId: roomId });
      if (!room) {
        socket.emit("message-error", { message: "room not found" });
        return;
      }
      room.messages.push(message._id);
      await room.save();
      const populatedMessage = await Message.findById(message._id).populate('sender');
      io.to(roomId).emit("new-message", populatedMessage);
    } catch (error) {
      console.log(error);
      socket.emit("message-error", { message: "server error" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  connectDb();
});
