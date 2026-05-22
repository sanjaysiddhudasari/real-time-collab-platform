const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const initSocket = require("./sockets/socket");
const cors=require('cors');
const runCode=require('./sockets/handlers/runCode')

const { createServer } = require("http");
const { Server } = require("socket.io");
const Room=require('./models/room.model')
const User=require('./models/user.model')

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/rooms.routes");
const connectDb = require("./db/connection");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

const httpServer = createServer(app);
const io = initSocket(httpServer);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  

  // room 

  socket.on("join-room", async( {roomId,userId,username} ) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
    try {
      const room=await Room.findOne({roomId:roomId}).populate("participants","username");
      if(!room){
        socket.emit("room-error",{
          message:"room not found"
        })
      }
      console.log(room);
      io.to(roomId).emit("room-data",room);
      console.log(userId);
      io.to(roomId).emit("user-joined",{username});
    } catch (error) {
      console.log(error);
      socket.emit("room-error",{
        message:"server error"
      })
    }
  });


  socket.on("leave-room",async({roomId,username,userId})=>{
    socket.leave(roomId);
    socket.to(roomId).emit("user-left",{username,userId});
    try {
      const room=await Room.findOne({roomId:roomId}).populate("participants","username");
      if(!room){
        socket.emit("room-error",{
          message:"server error "
        })
      }
      socket.to(roomId).emit("room-data",room);
    } catch (error) {
      console.log(error);
      socket.emit("room-error",{message:"server error "});
    }
  });

  socket.on("sync-code",({roomId,code})=>{
    io.to(roomId).emit("receive-code",{code});
  });

  socket.on("lang-change",({roomId,lang})=>{
    io.to(roomId).emit("lang-change",{lang});
  })

  socket.on("run-code",({roomId,code,lang})=>{
    runCode({code,lang,roomId},io);
    io.to(roomId).emit("run-start");
  })    


  // cursor styles 

  socket.on("cursor-move",({roomId,userId,username,position})=>{
    socket.to(roomId).emit("cursor-move",{userId,username,position});
  })


  //messages



  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);

  connectDb();
});
