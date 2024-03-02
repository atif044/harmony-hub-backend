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
    isApproved:{
        type:Boolean,
        default:false
    },
    isApprovedByAdmin:{
        type:Boolean,
        default:false
    },
    studentsList:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    currentCollaboratedEvents:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
    }],
    pastCollaboratedEvents:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        }
    ]
}

module.exports=schema.modelMake("University",schema.schemaMake(modal));