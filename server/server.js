const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { createServer } = require("http");
const { Server } = require("socket.io");
const Room=require('./models/room.model')

dotenv.config();

const authRoutes = require("./routes/auth.routes");
const roomRoutes = require("./routes/rooms.routes");
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

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // room 

  socket.on("join-room", async( {roomId} ) => {
    socket.join(roomId);

    console.log(`${socket.id} joined room ${roomId}`);
    try {
      const room=await Room.findOne({roomId:roomId}).populate("participants","username");
      if(!room){
        socket.emit("room-error",{
          message:"room not found"
        })
      }
      io.to(roomId).emit("room-data",room);
    } catch (error) {
      console.log(error);
      socket.emit("room-error",{
        message:"server error"
      })
    }
  });


  socket.on("leave-room",(roomId)=>{
    socket.leave(roomId);
    socket.to(roomId).emit("user-left",{socketId:socket.id});
  });

  socket.on("sync-code",({roomId,code})=>{
    io.to(roomId).emit("receive-code",code);
  });

  socket.on("lang-change",({roomId,lang})=>{
    io.to(roomId).emit("lang-change",{lang});
  })

  socket.on("run-code",({roomId,code,lang})=>{
    //use docker containers 
  })    


  //messages



  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  connectDb();
});
