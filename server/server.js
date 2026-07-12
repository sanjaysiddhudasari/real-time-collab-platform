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
    origin: true,
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
const httpServer = createServer(app);
const io = initSocket(httpServer);

// Track which rooms each user is in (for clean disconnect handling)
const userRooms = new Map(); // userId → { rooms: Set<roomId>, username: string }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Safe userId accessor — returns null if socket not authenticated
  const getUserId = () => socket.userId?.toString() || null;

  // room 

  socket.on("join-room", async ({ roomId }) => {
    const uid = getUserId();
    if (!uid) {
      socket.emit("room-error", { message: "unauthorized" });
      return;
    }
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === uid);
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    }
    socket.join(roomId);

    // Track this user's room membership
    if (!userRooms.has(uid)) {
      userRooms.set(uid, { rooms: new Set(), username: '' });
    }
    userRooms.get(uid).rooms.add(roomId);

    const username = await User.findById(uid).then(u => u.username).catch(e => null);
    // Cache username for disconnect use
    if (userRooms.has(uid)) {
      userRooms.get(uid).username = username || 'Unknown';
    }

    console.log(`${socket.id} joined room ${roomId}`);
    try {
      const roomData = await Room.findOne({ roomId: roomId }).populate([
        { path: "participants", select: "username" },
        { path: "messages", populate: { path: "sender", select: "username" } }
      ]);
      if (!roomData) {
        socket.emit("room-error", {
          message: "room not found"
        })
        return;
      }
      console.log(roomData);
      io.to(roomId).emit("user-joined", { username, userId: uid });
      io.to(roomId).emit("user-online",{userId:uid, username});
      socket.emit("room-data", roomData);
    } catch (error) {
      console.log(error);
      socket.emit("room-error", {
        message: "server error"
      })
    }
  });


  socket.on("leave-room", async ({ roomId }) => {
    const uid = getUserId();
    if (!uid) return;
    const user = await User.findById(uid);
    if (!user) {
      socket.emit("room-error", { message: "server-error" });
      return;
    }
    const username = user.username;
    socket.leave(roomId);

    // Clean up room tracking
    if (userRooms.has(uid)) {
      userRooms.get(uid).rooms.delete(roomId);
      if (userRooms.get(uid).rooms.size === 0) {
        userRooms.delete(uid);
      }
    }
    io.to(roomId).emit("user-offline",{userId: uid});
    socket.to(roomId).emit("user-left", { username, userId: uid });
    try {
      const roomData = await Room.findOne({ roomId: roomId }).populate([
        { path: "participants", select: "username" },
        { path: "messages", populate: { path: "sender", select: "username" } }
      ]);
      if (!roomData) {
        socket.emit("room-error", {
          message: "server error "
        })
        return;
      }
      socket.to(roomId).emit("room-data", roomData);
    } catch (error) {
      console.log(error);
      socket.emit("room-error", { message: "server error " });
    }
  });

  socket.on("sync-code", async ({ roomId, code, fileId }) => {
    const uid = getUserId();
    if (!uid) return;
    console.log({ roomId, code, fileId });
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === getUserId());
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
    const uid = getUserId();
    if (!uid) return;
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === getUserId());
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
    const uid = getUserId();
    if (!uid) return;
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    };
    const user = await User.findById(uid);
    const runUsername = user?.username || "Unknown";
    const file = room.files.find(f => f && f._id?.toString() === fileId?.toString());
    if (!file) {
      socket.emit("room-error", { message: " file not found " })
      return;
    }
    runCode({ code: file.code, lang: file.lang, roomId, fileId }, io);
    io.to(roomId).emit("run-start", { fileId, username: runUsername });
  })


  // cursor styles 

  socket.on("cursor-move", async ({ roomId, fileId, position }) => {
    const uid = getUserId();
    if (!uid) return;
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === getUserId());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    }
    const user = await User.findById(socket.userId).select('username');
    const username = user.username;
    socket.to(roomId).emit("cursor-move", { userId: getUserId(), username, fileId, position });
  });

  
  socket.on("typing",async({roomId})=>{
    const uid = getUserId();
    if (!uid) return;
    const room=await Room.findOne({roomId:roomId});
    const isPresent = room.participants.find(u => u._id.toString() === getUserId());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    };
    socket.to(roomId).emit("user-typing",{userId:getUserId()});
  })


  //messages

  socket.on("send-message", async ({ roomId, content }) => {
    const uid = getUserId();
    if (!uid) return;
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("message-error", { message: "room not found" });
      return;
    }
    const isPresent = room.participants.find(u => u._id.toString() === getUserId());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    };
    try {
      const user = await User.findById(getUserId());
      if (!user) {
        socket.emit("message-error", { message: "user not found" });
        return;
      }
      console.log({ roomId, userId: getUserId(), content });
      const message = await Message.create({
        roomId,
        sender: getUserId(),
        content: content
      });
      room.messages.push(message._id);
      await room.save();
      const populatedMessage = await Message.findById(message._id).populate('sender');
      io.to(roomId).emit("new-message", populatedMessage);
    } catch (error) {
      console.log(error);
      socket.emit("message-error", { message: "server error" });
    }
  });


  socket.on("create-file", async ({ roomId, name, lang }) => {
    const uid = getUserId();
    if (!uid) return;
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("message-error", { message: "room not found" });
      return;
    };
    const isPresent = room.participants.find(u => u._id.toString() === getUserId());
    if (!isPresent) {
      socket.emit("room-error", { message: "unauthorized access" });
      return;
    };
    room.files.push({ name, lang, code: "" });
    await room.save();
    const createdFile = room.files[room.files.length - 1];
    io.to(roomId).emit("file-created", createdFile);
  })

  socket.on("rename-file", async ({ roomId, fileId, name }) => {
    const uid = getUserId();
    if (!uid) return;
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("room-error", { message: "room not found" });
      return;
    };
    const extLang = { js: "javascript", ts: "typescript", py: "python", cpp: "cpp", java: "java", go: "go", rs: "rust", rb: "ruby", php: "php", sql: "sql" };
    const ext = name.split(".").pop();
    const file = room.files.find(f => f._id.toString() === fileId.toString());
    if (file) {
      file.name = name;
      if (extLang[ext]) file.lang = extLang[ext];
      await room.save();
    }
    io.to(roomId).emit("file-renamed", { fileId, name, lang: file?.lang });
  })

  socket.on("delete-file", async ({ roomId, fileId }) => {
    const uid = getUserId();
    if (!uid) return;
    const room = await Room.findOne({ roomId });
    if (!room) return;
    room.files = room.files.filter((f) => f._id.toString() !== fileId.toString());
    await room.save();
    io.to(roomId).emit("file-deleted", { fileId });
  })

  socket.on("cursor-update", (data) => {
    socket.to(data.roomId).emit("cursor-update", data);
});

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    const uid = socket.userId?.toString();
    if (uid && userRooms.has(uid)) {
      const { rooms, username } = userRooms.get(uid);
      // Emit user-left to every room this user was in
      for (const roomId of rooms) {
        io.to(roomId).emit("user-offline",{userId:uid});
        io.to(roomId).emit("user-left", { username, userId: uid });
      }
      userRooms.delete(uid);
      console.log(`Cleaned up ${rooms.size} room(s) for disconnected user ${uid}`);
    }
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  connectDb();
});
