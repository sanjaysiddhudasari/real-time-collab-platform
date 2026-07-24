const express=require('express')
const protectRoute=require('../middlewares/protectRoute');
const {allMessages}=require('../controllers/message.controller');
const router=express.Router();

router.get('/:roomId/messages',protectRoute,allMessages);

module.exports=router;