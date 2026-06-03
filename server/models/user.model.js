const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true
        },
        email:{
            type:String,
            required:true,     
        },
        password:{
            type:String,
            required:true
        },
        isActive:{
            type:Boolean
        }
    },
    {timestamps:true}
);


module.exports=mongoose.models.User || mongoose.model('User',userSchema);