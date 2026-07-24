const express=require('express');
const jwt=require('jsonwebtoken');

const protectRoute=(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:'Unauthorized'});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET); 
        if(!decoded){
            return res.status(401).json({message:'Unauthorized'});
        }
        // console.log(decoded);
        req.userId=decoded.userId;  // we will set this in the req object so that we can use it in the controllers to get the current user
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized - invalid or expired token' });
        }
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports=protectRoute;