const express=require('express');
const { register, login, logout, getCurrentUser } = require('../controllers/auth.controller');
const protectRoute=require('../middlewares/protectRoute');

const router=express.Router();


router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
router.get('/me',protectRoute,getCurrentUser);

module.exports=router;
