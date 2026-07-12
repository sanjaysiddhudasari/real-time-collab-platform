const Room=require('../models/room.model');
const {nanoid} = require('nanoid')


const createRoom = async (req, res) => {
  try {
    const { roomname, language, visibility } = req.body;

    const roomId     = nanoid(10);
    const isPublic   = visibility === "public";
    const inviteCode = !isPublic ? nanoid(8) : undefined; 
    const lang       = language || "javascript";

    const newRoom = new Room({
      roomname,
      roomId,
      owner:    req.userId,
      language: lang,
      isPublic,
      inviteCode,  
    });

    newRoom.participants.push(req.userId);
    await newRoom.save();

    res.status(201).json({
      message:    "Room created successfully",
      roomId:     newRoom.roomId,
      inviteCode: newRoom.inviteCode || null,
    });

  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findOne({roomId}).populate([
            { path: "participants", select: "username" },
            { path: "messages", populate: { path: "sender", select: "username" } }
        ]);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        if (!room.isPublic && !room.participants.some(p => (p._id?.toString() || p.toString()) === req.userId.toString())) {
            return res.status(403).json({ message: 'Room not found' });
        }
        res.status(200).json({ room });
    } catch (error) {
        console.error('Error fetching room:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const joinRoom=async(req,res)=>{
    try{
        const {roomId}=req.params;
        const userId=req.userId;
        const room=await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:'Room not found'});
        }
        if(room.participants.some(participant => participant.toString() === userId.toString())){ 
            return res.status(400).json({message:'User already in the room'});
        }
        room.participants.push(userId);
        await room.save();
        res.status(200).json({message:'Joined room successfully', room});
    }catch(error){
        console.error('Error joining room:',error);
        res.status(500).json({message:'Internal server error'});
    }
}


const leaveRoom=async(req,res)=>{
    try{
        const {roomId}=req.params;
        const userId=req.userId;
        const room=await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:'Room not found'});
        }
        if(!room.participants.some(participant => participant.toString() === userId.toString())){
            return res.status(400).json({message:'User not in the room'});
        }
        room.participants=room.participants.filter(participant=>participant.toString()!==userId.toString()); 

        // Delete room if no participants left
        if(room.participants.length===0){
            await Room.deleteOne({_id: room._id});
            return res.status(200).json({message:'Room deleted — no participants left'});
        }

        await room.save();
        res.status(200).json({message:'Left room successfully'});
    }catch(error){
        console.error('Error leaving room:',error);
        res.status(500).json({message:'Internal server error'});
    }   

};

const getAllRooms=async(req,res)=>{
    try {
        const userId=req.userId;
        const rooms=await Room.find({$or:[{owner:userId},{isPublic:true}]}).populate("participants","username");
        res.status(200).json({rooms,userId});
    } catch (error) {
        console.error('Error in Get All Rooms',error);
        res.status(500).json({message:"internal server error"})
    }
}


const deleteRoom=async(req,res)=>{
    try {
        const {roomId}=req.params;
        const room = await Room.findOne({roomId});
        if (!room) return res.status(404).json({message:"Room not found"});
        const io = req.app.get("io");
        io.to(roomId).emit("room-deleted");
        await Room.deleteOne({roomId:roomId});
        res.status(200).json({message:"succesfully deleted"});
    } catch (error) {
        console.error('Error in delete Rooms',error);
        res.status(500).json({message:"internal server error"})
    }
}

const runCode=async(req,res)=>{
    try {
        const {code,lang}=req.body;
        
    } catch (error) {
        
    }
}

const joinByInvite=async(req,res)=>{
    try{
        const {code}=req.params;
        const userId=req.userId;
        const room=await Room.findOne({inviteCode:code});
        if(!room){
            return res.status(404).json({message:'Invalid invite link'});
        }
        if(!room.participants.some(p=>p.toString()===userId.toString())){
            room.participants.push(userId);
            await room.save();
        }
        res.status(200).json({message:'Joined room',roomId:room.roomId});
    }catch(error){
        console.error('Error joining by invite:',error);
        res.status(500).json({message:'Server error'});
    }
}

module.exports={createRoom,getRoomById,joinRoom,leaveRoom,getAllRooms,deleteRoom,runCode,joinByInvite};