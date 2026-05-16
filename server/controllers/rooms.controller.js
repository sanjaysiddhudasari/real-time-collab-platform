const Room=require('../models/room.model');
const {nanoid} = require('nanoid')

const createRoom=async(req,res)=>{
    try{
        const {roomname,isPublic,language}=req.body;
        const roomId=nanoid(10);
        let inviteCode=null;
        if(isPublic===false){
            inviteCode=nanoid(8);
        }
        const lang=language||"javascript";
        const newRoom=new Room({roomname,roomId,owner:req.userId,language:lang,isPublic,inviteCode}); 
        newRoom.participants.push(req.userId);
        await newRoom.save();
        res.status(201).json({message:'Room created successfully',roomId:newRoom.roomId});
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

        //owner assignment 
        if(room.owner.toString()===userId){
            if(room.participants.length>0){
                room.owner=room.participants[0];
            }else{
                await Room.deleteById(room._id);
                return res.status(200).json({message:'Left room successfully, room deleted as it has no participants'});
            }
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
        const response=await Room.deleteOne({roomId:roomId});
        res.status(200).json({message:"succesfully deleted"});
    } catch (error) {
        console.error('Error in delete Rooms',error);
        res.status(500).json({message:"internal server error"})
    }
}

module.exports={createRoom,getRoomById,joinRoom,leaveRoom,getAllRooms,deleteRoom};