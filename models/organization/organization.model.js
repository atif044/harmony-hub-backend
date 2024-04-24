const schema = require("../mongoose");
const mongoose = require("mongoose");
const modal = {
  organizationName: {
    type: String,
    required: true,
  },
  organizationEmail: {
    type: String,
    required: true,
  },
  organizationPassword: {
    type: String,
    required: true,
  },
  organizationPhoneNo:{
    type: String,
    required: true,
  },
  organizationSize:{
    type:Number,
    required:true
  },
  organizationWebsiteLink:{
    type: String,
    required: true,
  },
  organizationDescription:{
    type: String,
    // required: true,
  },
  isVerified: {
    type: Boolean,
    default: 0,
  },
  isVerifiedByAdmin: {
    type: Boolean,
    default: 0,
  },
  currentOrganizationEvents:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
  ],
  pastOrganizationEvents:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
  ],

};
module.exports = schema.modelMake("Organization", schema.schemaMake(modal));
