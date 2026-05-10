const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const roomSchema=new Schema(
    {
        roomId:{
            type:String,
            required:true,
            unique:true
        },
        roomname:{
            type:String,
            required:true,
            unique:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        participants:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                default:[]
            }
        ],
        currentCode:{
            type:String,
            default:''
        },
        language:{
            type:String,
            default:'javascript'
        },
        messages:[
            {
                type:mongoose.Schema.Types.ObjectId,    
                ref:'Message',
                default:[]
            }
        ]
    }
);

module.exports=mongoose.model('Room',roomSchema);