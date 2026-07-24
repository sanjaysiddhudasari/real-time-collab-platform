const User=require('../models/user.model');
const bcrypt=require('bcryptjs');
const generateTokenAndSetCookies=require('../utils/generateToken');
const register=async(req,res)=>{
    try{
        const {username,email,password}=req.body;
        if(!username || !email || !password){
            return res.status(400).json({message:'All fields are required'});
        }
        //email regex validation
        const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message:'Invalid email format'});
        }

        const existingUser=await User.findOne({username});
        if(existingUser){
            return res.status(400).json({message:'User already exists'});
        }

        if(password.length<6){
            return res.status(400).json({message:'Password must be at least 6 characters long'});
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser=new User({username,email,password:hashedPassword,isActive:false}); 
        if(newUser){
            await newUser.save();
            generateTokenAndSetCookies(newUser._id,res);
            res.status(201).json({message:'User registered successfully',user:{id:newUser._id,username:newUser.username,email:newUser.email}}); 
        }
    } catch (error) {
        res.status(500).json({message:'Internal server error'});
        console.error('Error in register:', error);
    }
};

const login=async(req,res)=>{
    try{
        const {username,password}=req.body;
        if(!username || !password){
            return res.status(400).json({message:'All fields are required'});
        }
        const user=await User.findOne({username});
        if(!user){
            return res.status(400).json({message:'Invalid credentials'});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:'Invalid credentials'});
        }
        generateTokenAndSetCookies(user._id,res);
        res.status(200).json({message:'Login successful',user:{userId:user._id,username:user.username,email:user.email,isActive:true}});
    } catch (error) {
        res.status(500).json({message:'Internal server error'});
        console.error('Error in login:', error);
    }
};  

const logout=async(req,res)=>{
    try{
        const userId=req.userId;
        const user=await User.updateOne({_id:userId},{$set:{isActive:false}});
        res.clearCookie('jwt',{httpOnly:true,secure:process.env.NODE_ENV==='production'});
        res.status(200).json({message:'Logout successful'});
    } catch (error) {
        res.status(500).json({message:'Internal server error'});
        console.error('Error in logout:', error);
    }
}

const getCurrentUser=async(req,res)=>{
    try{
        const userId=req.userId;  // we will set this in the auth middleware why because we will verify the token and extract the userId from it and set it in the req object
        const user=await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json({user});
    } catch (error) {
        res.status(500).json({message:'Internal server error'});
        console.error('Error in getCurrentUser:', error);
    }
}


module.exports={
    register,
    login,
    logout,
    getCurrentUser
}