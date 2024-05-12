const schema = require("../mongoose");
const mongoose = require("mongoose");
const modal ={
    universityName:{
        type:String,
        required:true
    },
    universityEmail:{
        type:String,
        required:true
    },
    universityPassword:{
        type:String,
        required:true
    },
    campus:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isVerifiedByAdmin:{
        type:Boolean,
        default:false
    },
    studentsList:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      pendingStudentList:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
      ],
      rejectedStudentList:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
      ],
    currentCollaboratedEvents:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    }],
    pendingCollaborateEvents:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    }],
    pastCollaboratedEvents:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        }
    ],
    city:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
}

module.exports=schema.modelMake("University",schema.schemaMake(modal));