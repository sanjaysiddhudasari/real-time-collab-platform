const express=require('express');
const {createRoom,getRoomById,joinRoom,leaveRoom,getAllRooms,deleteRoom,runCode,joinByInvite}=require('../controllers/rooms.controller');
const protectRoute=require('../middlewares/protectRoute');

const router=express.Router();

router.post('/',protectRoute,createRoom);
router.get('/',protectRoute,getAllRooms);
router.get('/invite/:code',protectRoute,joinByInvite);
router.get('/:roomId',protectRoute,getRoomById);
router.post('/:roomId/join',protectRoute,joinRoom);
router.post('/:roomId/leave',protectRoute,leaveRoom);
router.delete('/:roomId',protectRoute,deleteRoom);
router.post('/run',protectRoute,runCode);


module.exports=router;