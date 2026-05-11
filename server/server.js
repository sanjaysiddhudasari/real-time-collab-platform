const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors=require('cors')

const { createServer } = require('http');
const { Server } = require('socket.io');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const roomRoutes = require('./routes/rooms.routes');
const connectDb = require('./db/connection');

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true,
}))


app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {

        socket.join(roomId);

        console.log(`${socket.id} joined room ${roomId}`);

        socket.to(roomId).emit("user-joined", {
            socketId: socket.id
        });

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