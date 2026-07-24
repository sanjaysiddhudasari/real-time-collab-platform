const express=require('express');
const { register, login, logout, getCurrentUser } = require('../controllers/auth.controller');
const protectRoute=require('../middlewares/protectRoute');
const {googleAuth,googleCallback}=require('../controllers/googleAuth.controller')

const router=express.Router();


router.post('/register',register);
router.post('/login',login);
router.post('/logout',protectRoute,logout);
router.get('/me',protectRoute,getCurrentUser);

router.get('/google',googleAuth);
router.get('/google/callback',googleCallback);

module.exports=router;
