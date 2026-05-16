const express=require('express');
const {createRoom,getRoomById,joinRoom,leaveRoom,getAllRooms,deleteRoom}=require('../controllers/rooms.controller');
const protectRoute=require('../middlewares/protectRoute');

const router=express.Router();

router.post('/',protectRoute,createRoom);
router.get('/',protectRoute,getAllRooms);
router.get('/:roomId',protectRoute,getRoomById);
router.post('/:roomId/join',protectRoute,joinRoom);
router.post('/:roomId/leave',protectRoute,leaveRoom);
router.delete('/:roomId',protectRoute,deleteRoom);


module.exports=router;