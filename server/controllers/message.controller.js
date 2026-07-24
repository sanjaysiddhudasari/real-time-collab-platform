const Message=require('../models/message.model');
const allMessages = async (req, res) => {
    try{
        const {roomId} = req.params;
        const messages=await Message.find({roomId:roomId}).populate('sender','username').sort({createdAt:1});
        res.status(200).json(messages);
        console.log(messages);
    }catch(error){
        res.status(500).json({message:'Internal server error'});
        console.error('Error in allMessages:', error);
    }
}

module.exports={allMessages};