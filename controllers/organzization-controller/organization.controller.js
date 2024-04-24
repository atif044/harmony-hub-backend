const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const Organization = require("../../models/organization/organization.model");
const generateJwtOrganization = require("../../utils/generateJwtOrganization");
const Token = require("../../models/token/token.model");
const bcrypt = require("bcrypt");
const { uniqueToken } = require("../../utils/generateToken");
const { sendEmail } = require("../email-controller/email.controller");
const { uploadaImageToCloudinary } = require("../../utils/uploadToCloudinary");
const Event=require("../../models/event/event.model");
const University=require('../../models/university/university.model');
const { default: mongoose, Mongoose } = require("mongoose");
exports.createOrganizationAccount = catchAsyncErrors(async (req, res, next) => {
  const { organizationEmail, organizationPassword, organizationName,organizationPhoneNo,organizationWebsiteLink,organizationSize } =
    req.body.data;
  try {
    let organizationAccount = await Organization.find({
      organizationEmail,
    });
    if (organizationAccount.length === 1) {
      return next(new ErrorHandler("Account Already Exists", 400));
    }

    let hashedPassword = await bcrypt.hash(organizationPassword,10)
    if (hashedPassword) {
      let account = await Organization.create({
        organizationEmail,
        organizationPassword: hashedPassword,
        organizationName,
        organizationPhoneNo,
        organizationWebsiteLink,
        organizationSize
      });
      await account.save();
      const data = {
        user: {
          id: account._id,
          email: account.organizationEmail,
        },
      };
      const authToken = generateJwtOrganization(data);
      res.cookie("harmony-hub-organization", authToken, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.cookie("isVerified", account.isVerified, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const emailVerificationToken = uniqueToken(5);
      const token = new Token({
        email: account.organizationEmail,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        account.organizationEmail,
        "Email Verification",
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - Organization</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }

    h1 {
      color: #333333;
    }

    p {
      color: #666666;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email</h1>
    <p>Your verification cod is ${emailVerificationToken}</p>
  </div>
</body>
</html>`
      );
      return res.status(201).json({
        status: "success",
        verified: account.isVerified,
        message: [
          "Successfully signed up",
          "An email is sent to your account to verify your identity.",
        ],
        body: authToken,
      });
    }
    return next(new ErrorHandler("Error Hashing the password", 400));
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  } finally {
    req.body = null;
  }
});
exports.loginOrganizationAccount = catchAsyncErrors(async (req, res, next) => {
  const { organizationEmail, organizationPassword } = req.body.data;
  try {
    const response = await Organization.find({ organizationEmail });
    if (response.length === 0) {
      return next(new ErrorHandler("Email or Password is Incorrect", 400));
    }
    let passwordCompare = await bcrypt.compare(organizationPassword, response[0].organizationPassword);
    if (!passwordCompare) {
      return next(new ErrorHandler("Email or password is incorrect", 400));
    }
    const data = {
      user: {
        id: response[0]._id,
        email: response[0].organizationEmail,
      },
    };
    const authToken = generateJwtOrganization(data);
    res.cookie("harmony-hub-organization", authToken, {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
      res.cookie("isVerified", response[0].isVerified, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      if(response[0]===false){
        const emailVerificationToken = uniqueToken(5);
      const token = new Token({
        email: response[0].organizationEmail,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        response[0].organizationEmail,
        "Email Verification",
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - Organization</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }

    h1 {
      color: #333333;
    }

    p {
      color: #666666;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    @media only screen and (max-width: 600px) {
      .container {
        padding: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email</h1>
    <p>Your verification cod is ${emailVerificationToken}</p>
  </div>
</body>
</html>`
      );
      }
    
    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      body: authToken,
      isVerified:response[0].isVerified
    });
  } catch (error) {
    console.log(error)
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  } finally {
    req.body = null;
  }
});
exports.verifyEmailToken=catchAsyncErrors(async(req,res,next)=>{
  const { token } = req.params;
  const email=req.userData.user.email;
  try {
    const validToken = await Token.findOne({
      token: token,
      tokenType:"emailVerification",
      email:email
      
    });
    console.log(validToken)
    if (!validToken) {
      return next(new ErrorHandler("Invalid or Expired Token",400))
    }
    const organizationEmail = validToken.email;
    let  organization= await Organization.findOne({ organizationEmail },{isVerified:false});
    if(!organization){
      return next(new ErrorHandler("Organization Not Found",404))
    }
    organization.isVerified=true;
    let saved=await organization.save();
    if(!saved){
      return next("Error Verifying your account. Please try again later",400);
    }
    await Token.findByIdAndDelete(validToken._id);
    res.cookie("isVerified", true, {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res
      .status(200)
      .json({ status: "success", message: "Email Verified Successful",body:"true" });
  } catch (error) {
    console.log(error)
    return next(new ErrorHandler(error.message, error.code || error.statusCode))
  }
});
exports.resendOTP=catchAsyncErrors(async(req,res,next)=>{
  const userId=req.userData.user.id;
  try {
    let user=await Organization.findById(userId).select("organizationEmail").select("isVerified");
    console.log(user)
    if(!user){
      return next(new ErrorHandler("User Not Found",400));
    }
    if(user.isVerified===true){
      return next(new ErrorHandler("Already Verified",400));
    }
      let emailVerificationToken=uniqueToken(5);
      await Token.findOneAndDelete({email:user.organizationEmail})
      let token= new Token({
        email:user.organizationEmail,
        token:emailVerificationToken,
        tokenType:"emailVerification",
        tokenExpiry:Date.now()
      })
      await token.save()
      await sendEmail(user.organizationEmail,"Email Verification",`Your OTP is:${emailVerificationToken}`)
      return res.status(200).json({status:"success",message:"A Email has send to you. Please verify Email"})    
  } catch (error) {
    console.log(error)
    return next(new ErrorHandler(error.message, error.code || error.statusCode))

  }
});
exports.createEvent=catchAsyncErrors(async(req,res,next)=>{
  let id=req.userData.user.id;
  const {EventName,EventDescription,VolunteersRequired,eventLocationLink,eventLocationName,eventLocationEmbededLink,eventDurationInDays,eventStartDate,eventEndDate,eventStartTime,eventEndTime,universityId,country,city}=req.body;
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  console.log(req.body)
  const match = eventLocationLink.match(regex);
  if (!match) {
    return next(new ErrorHandler("Location Link is not Valid",400))
  } 
  if(!req.file){
    return next(new ErrorHandler("Image is Compulsory",400));
  }
  const latitude = match[1];
    const longitude = match[2];
  try {
    let url=await uploadaImageToCloudinary(req.file.buffer);
    let event=new Event({
      EventName,
      EventDescription,
      VolunteersRequired:VolunteersRequired,
      eventLocationLink,
      eventLocationName,
      eventLocationEmbededLink,
      eventDurationInDays,
      EventImage:url.secure_url,
      longitude:longitude,
      latitude:latitude,
      universityId:!universityId?null:universityId,
      organizationId:id,
      eventStartDate,
      eventEndDate,
      eventStartTime,
      eventEndTime,
      country:country,
      city:city
    });
    let saved=await event.save();
    await Organization.updateOne({_id:id}, { $push: { ["currentOrganizationEvents"]: saved._id }, });
    await University.updateOne({_id:universityId,},{ $push: { ["pendingCollaborateEvents"]: saved._id }, })
    return res.status(201).json({status:"success",message:"Event Listed Successfully"});
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.allEvents=catchAsyncErrors(async(req,res,next)=>{
  const id=req.userData.user.id;
  try{
    let events=await Organization.findOne({_id:id}).populate('currentOrganizationEvents');
      return res.status(200).json({status:"success",body:events.currentOrganizationEvents});
  }
  catch(error){
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.eventDetails=catchAsyncErrors(async(req,res,next)=>{
  const id = new mongoose.Types.ObjectId(req.params.id);
const orgId =new mongoose.Types.ObjectId(req.userData.user.id);
  try {
    let event=await Event.findOne({_id:id,organizationId:orgId}).populate('universityId');
    return res.status(200).json({status:"success",body:event});
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
});
exports.editEventDetails=catchAsyncErrors(async(req,res,next)=>{
  const eventId=req.params.id;
  let id=req.userData.user.id;
  const {EventName,EventDescription,VolunteersRequired,eventLocationLink,eventLocationName,eventLocationEmbededLink,eventDurationInDays,eventStartDate,eventEndDate,eventStartTime,eventEndTime,universityId}=req.body;

   
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = eventLocationLink.match(regex);
  if (!match) {
    return next(new ErrorHandler("Location Link is not Valid",400))
  } 

  const latitude = match[1];
    const longitude = match[2];
  try {
    let url=null;
    let event=null;
    const mongooseEventId= new mongoose.Types.ObjectId(eventId)
    let beforeEvent=await Event.findById({_id:mongooseEventId});
    console.log(beforeEvent)
    if(req.file){
       url=await uploadaImageToCloudinary(req.file.buffer);
        event=await  Event.findByIdAndUpdate({_id:eventId},{
        EventName,
        EventDescription,
        VolunteersRequired:VolunteersRequired,
        eventLocationLink,
        eventLocationName,
        eventLocationEmbededLink,
        eventDurationInDays,
        EventImage:url?.secure_url,
        longitude:longitude,
        latitude:latitude,
        organizationId:id,
        eventStartDate,
        eventEndDate,
        eventStartTime,
        eventEndTime
      });
    }
    else{
       event= await Event.findByIdAndUpdate({_id:eventId},{
        EventName,
        EventDescription,
        VolunteersRequired:VolunteersRequired,
        eventLocationLink,
        eventLocationName,
        eventLocationEmbededLink,
        eventDurationInDays,
        longitude:longitude,
        latitude:latitude,
        organizationId:id,
        eventStartDate,
        eventEndDate,
        eventStartTime,
        eventEndTime
      });
    }
    let saved=await event.save();

    return res.status(201).json({status:"success",message:"Event Updated Successfully"});
  } catch (error) {
    console.log(error)
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
})
exports.checkIfPendingOrApprovedByUniversity=catchAsyncErrors(async(req,res,next)=>{
  const eventId=req.params.id;
  let {uniId}=req.body;
  try {
    const university = await University.findById(uniId);
    if(!university){
      return next(new ErrorHandler("University Not Found",400));
    }
    else if (university.pendingCollaborateEvents.includes(eventId))
    {
      return res.status(200).json({status:"success",body:"pending"})
    }
    else if (university.currentCollaboratedEvents.includes(eventId)) {
      return res.status(200).json({status:"success",body:"approved"});
  }
  return next(new ErrorHandler('No Event Exist with this id in the university',400));
    
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));

  }
});
