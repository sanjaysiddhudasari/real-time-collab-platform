const Room=require('../models/room.model');
const {v4:uuidv4}=require('uuid');

const createRoom=async(req,res)=>{
    try{
        const {roomname}=req.body;
        const existsingRoom=await Room.findOne({roomname});
        if(existsingRoom){
            return res.status(400).json({message:'Room name already exists'});
        }
        const roomId=uuidv4();
        const newRoom=new Room({roomname,roomId,owner:req.user._id});
        await newRoom.save();
        res.status(201).json({message:'Room created successfully'});
    }
catch(error){
        console.error('Error creating room:',error);
        res.status(500).json({message:'Internal server error'});
    }   
};

const getRoomById=async(req,res)=>{
    try{
        const {roomId}=req.params;
        const room=await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:'Room not found'});
        }
        res.status(200).json({room});
    }catch(error){
        console.error('Error fetching room:',error);
        res.status(500).json({message:'Internal server error'});
    }
};


const joinRoom=async(req,res)=>{
    try{
        const {roomId}=req.params;
        const {userId}=req.body;
        const room=await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:'Room not found'});
        }
        if(room.participants.includes(userId)){
            return res.status(400).json({message:'User already in the room'});
        }
        room.participants.push(userId);
        await room.save();
        res.status(200).json({message:'Joined room successfully'});
    }catch(error){
        console.error('Error joining room:',error);
        res.status(500).json({message:'Internal server error'});
    }
}


const leaveRoom=async(req,res)=>{
    try{
        const {roomId}=req.params;
        const {userId}=req.body;
        const room=await Room.findOne({roomId});
        if(!room){
            return res.status(404).json({message:'Room not found'});
        }
        if(!room.participants.includes(userId)){
            return res.status(400).json({message:'User not in the room'});
        }
        room.participants=room.participants.filter(participant=>participant.toString()!==userId);
        await room.save();
        res.status(200).json({message:'Left room successfully'});
    }catch(error){
        console.error('Error leaving room:',error);
        res.status(500).json({message:'Internal server error'});
    }   

};

module.exports={createRoom,getRoomById,joinRoom,leaveRoom};