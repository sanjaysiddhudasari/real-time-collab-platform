const express=require('express');
const {streamController}=require('../controllers/aiReview.controller');
const protectRoute=require('../middlewares/protectRoute');

const router=express.Router();

router.post('/review',protectRoute, streamController); 

module.exports=router;