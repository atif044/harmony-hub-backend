const schema = require("../mongoose");
const mongoose = require("mongoose");
modal = {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: [true, "It is a Required Field"],
    min: [2, "Firt Name must be atleast 2 characters"],
  },
  lastName: {
    type: String,
    required: [true, "It is a Required Field"],
    min: [2, "Last Name must be atleast 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is a required field"],
    unique: [true, "Email must be unique"],
  },
  dateOfBirth:{
    type:Date,
    required:true
  },
  password: {
    type: String,
    required: [true, "Password is a required field"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bio: {
    type: String,
    max:255
  },
  eventAppliedFor:[
    {
        type:mongoose.Types.ObjectId,
        ref:"Event"
    }
  ],
  certifications:{
    type:Array
  },
  isVerifiedByAdmin:{
    type:Boolean,
    default:true
  },
  universityId:{
    type:mongoose.Types.ObjectId,
    ref:"University"
  }
};
module.exports=schema.modelMake("User",schema.schemaMake(modal))