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
const Message=require('./models/message.model')

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/rooms.routes");
const messageRoutes=require('./routes/message.routes')
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
app.use("/api/messages",messageRoutes);
const httpServer = createServer(app);
const io = initSocket(httpServer);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  

  // room 

  socket.on("join-room", async( {roomId,userId,username} ) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);
    try {
      const room=await Room.findOne({roomId:roomId}).populate([
        { path: "participants", select: "username" },
        { path: "messages", populate: { path: "sender", select: "username" } }
      ]);
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

  socket.on("sync-code",async({roomId,code,fileId})=>{
    const room=await Room.findOne({roomId:roomId});
    const file=room.files.find(f=>f._id.toString()===fileId.toString());
    if(file){
      file.code=code;
      await room.save();
    }
    socket.to(roomId).emit("receive-code",{code,fileId});
  });

  socket.on("lang-change",async({roomId,lang,fileId})=>{
    const room =await Room.findOne({roomId:roomId});
    const file=room.files.find(f=>f._id.toString()===fileId.toString());
    console.log({roomId,lang,fileId});
    if(file){
      file.lang=lang;
      await room.save();
    }
    io.to(roomId).emit("lang-change",{lang,fileId});
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

  socket.on("send-message",async({roomId,userId,content})=>{
    try {
      const user=await User.findById(userId);
      if(!user){
        socket.emit("message-error",{message:"user not found"});
      }
      console.log({roomId,userId,content});
      const message=await Message.create({
        roomId,
        sender:userId,
        content:content
      });
      const room=await Room.findOne({roomId:roomId});
      if(!room){
        socket.emit("message-error",{message:"room not found"});
      }
      room.messages.push(message._id);
      await room.save();
      const populatedMessage=await Message.findById(message._id).populate('sender');
      io.to(roomId).emit("new-message",populatedMessage);
    } catch (error) {
      console.log(error);
      socket.emit("message-error",{message:"server error"});
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
