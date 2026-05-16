const mongoose = require("mongoose");

const User = require("./models/user.model");
const Room = require("./models/room.model");

mongoose
  .connect("mongodb+srv://sanjay:sanjay%407929@cluster0.nmnyn2c.mongodb.net/realtimecollab?appName=Cluster0")
  .then(() => {
    console.log("DB Connected");
    seed();
  })
  .catch((err) => console.log(err));

const seed = async () => {
  try {

    // clear old data
    await User.deleteMany();
    await Room.deleteMany();

    // ── Users ─────────────────────────────────────
    const users = await User.insertMany([
      {
        username: "sanjay",
        email: "sanjay@gmail.com",
        password: "hashedpassword1",
      },
      {
        username: "rahul",
        email: "rahul@gmail.com",
        password: "hashedpassword2",
      },
      {
        username: "priya",
        email: "priya@gmail.com",
        password: "hashedpassword3",
      },
      {
        username: "aditya",
        email: "aditya@gmail.com",
        password: "hashedpassword4",
      },
      {
        username: "neha",
        email: "neha@gmail.com",
        password: "hashedpassword5",
      },
    ]);

    // easier references
    const [u1, u2, u3, u4, u5] = users;

    // ── Rooms ─────────────────────────────────────
    await Room.insertMany([
      {
        roomId: "rm_auth_101",
        roomname: "Authentication Service",
        owner: u1._id,
        participants: [u1._id, u2._id, u3._id],
        currentCode: "const jwt = require('jsonwebtoken');",
        language: "javascript",
        messages: [],
        isPublic: true,
        inviteCode: null,
      },

      {
        roomId: "rm_ml_202",
        roomname: "ML Recommendation Engine",
        owner: u3._id,
        participants: [u3._id, u4._id],
        currentCode: "import pandas as pd",
        language: "python",
        messages: [],
        isPublic: false,
        inviteCode: "MLX92QPA",
      },

      {
        roomId: "rm_cpp_303",
        roomname: "Competitive Programming",
        owner: u2._id,
        participants: [u1._id, u2._id, u4._id, u5._id],
        currentCode: "#include <bits/stdc++.h>",
        language: "cpp",
        messages: [],
        isPublic: true,
        inviteCode: "ABCDE",
      },

      {
        roomId: "rm_sys_404",
        roomname: "System Design Prep",
        owner: u4._id,
        participants: [u2._id, u4._id],
        currentCode: "Reverse proxy distributes requests...",
        language: "go",
        messages: [],
        isPublic: false,
        inviteCode: "SYS88ABC",
      },

      {
        roomId: "rm_ui_505",
        roomname: "React UI Components",
        owner: u5._id,
        participants: [u1._id, u3._id, u5._id],
        currentCode:
          "export default function Button(){ return <button/> }",
        language: "javascript",
        messages: [],
        isPublic: true,
        inviteCode: "WWWXSLQ",
      },
    ]);

    console.log("Seed data inserted successfully");

    process.exit();

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};