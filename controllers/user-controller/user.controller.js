const ErrorHandler = require('../../config/ErrorHandler');
const catchAsyncErrors = require('../../config/catchAsyncErrors');
const Event = require('../../models/event/event.model');
const Token=require('../../models/token/token.model');
const User = require('../../models/user/user.model');
const { uniqueToken } = require('../../utils/generateToken');
const {sendEmail}=require('../email-controller/email.controller');
const bcrypt=require("bcrypt");
const generateJwt=require('../../utils/generateJwt');
const { uploadaImageToCloudinary } = require('../../utils/uploadToCloudinary');

exports.createUserAccount=catchAsyncErrors(async(req,res,next)=>{
  try {
    const {email,password,gender,fullName,country,city,universityId,dateOfBirth}=req.body;
    console.log(req.body)
    let response= await User.findOne({email:email});    
    if(response?.length===1){
      return next(new ErrorHandler("An Account with this email already exists",400));
    }
     let profilePic=await uploadaImageToCloudinary(req.files[0].buffer);
     let cnicFront=await uploadaImageToCloudinary(req.files[2].buffer);
     let cnicBack=await uploadaImageToCloudinary(req.files[1].buffer);
    let hashedPassword=await bcrypt.hash(password,10);
    if(hashedPassword){
      const body=req.body;

      let account=await User.create(
        {
          profilePic:profilePic.secure_url,
          cnicBack:cnicBack.secure_url,
          cnicFront:cnicFront.secure_url,
          password:hashedPassword,
          email,
          gender:gender,
          fullName,country,city,universityId,dateOfBirth
        }
      )
    await account.save();
    const data = {
      user: {
        id: account._id,
        email: account.email,
      },
    };
    let authToken=generateJwt(data);
    res.cookie("harmony-hub-volunteer", authToken, {
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
      email: account.email,
      token: emailVerificationToken,
      tokenType: "emailVerification",
      tokenExpiry: new Date(Date.now()), // 1 hour
    });
    await token.save();
    await sendEmail(
      account.email,
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
    return next(new ErrorHandler(error.message, error.code || error.statusCode))
  }
})

exports.verifyEmailToken=catchAsyncErrors(async(req,res,next)=>{
    const { token } = req.params;
    try {
      const validToken = await Token.findOne({
        token: token,
        tokenType:"emailVerification"
      });
      if (!validToken) {
        return next(new ErrorHandler("Invalid or Expired Token",400))
      }
      const email = validToken.email;
      let user = await User.findOne({ email },{isVerified:false});
      if(!user){
        return next(new ErrorHandler("User Not Found",404))
      }
      user.isVerified=true;
      let saved=await user.save();
      if(!saved){
        return next("Error Verifying your account. Please try again later",400)
      }
      await Token.findByIdAndDelete(validToken._id);
      res.cookie("isVerified", true, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      return res
        .status(200)
        .json({ status: "success", message: "Email Verified Successful" });
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
    }
  });
exports.resendOTP=catchAsyncErrors(async(req,res,next)=>{
    const userId=req.userData.user.id;
    try {
      let user=await User.findById(userId).select("email").select("isVerified");
      if(!user){
        return next(new ErrorHandler("User Not Found",400));
      }
      if(user.isVerified===true){
        return next(new ErrorHandler("Already Verified",400));
      }
        let emailVerificationToken=uniqueToken(5);
        await Token.findOneAndDelete({email:user.email})
        let token= new Token({
          email:user.email,
          token:emailVerificationToken,
          tokenType:"emailVerifcation",
          tokenExpiry:Date.now()
        })
        await token.save()
        await sendEmail(user.email,"Email Verification",`Your OTP is:${emailVerificationToken}`)
        return res.status(200).json({status:"success",message:"A Email has send to you. Please verify Email"})
  
      
    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))
  
    }
  });


  exports.loginUserAccount=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    console.log(password)
    try {
      let response=await User.findOne({email});
      console.log(response)
      if(response.length===0){
        return next(new ErrorHandler("Email or Password is incorrect",400));
      }
      let passwordCompare = await bcrypt.compare(password, response.password);
    if (!passwordCompare) {
      return next(new ErrorHandler("Email or password is incorrect", 400));
    }
    const data = {
      user: {
        id: response._id,
        email: response.email,
      },
    };
    const authToken = generateJwt(data);
    res.cookie("harmony-hub-volunteer", authToken, {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
      res.cookie("isVerified", response.isVerified, {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      if(response.isVerified===false){
        const emailVerificationToken = uniqueToken(5);
      const token = new Token({
        email: response.email,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        response.email,
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
    console.log("hogya login")
    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      body: authToken,
      isVerified:response.isVerified
    });



    } catch (error) {
      return next(new ErrorHandler(error.message, error.code || error.statusCode))

    }
  })

// async function insertEvent() {
//   try {
//     // Create a new event instance using the provided data
//     const newEvent = new Event({
//       EventName: "HIIIII",
//       EventDescription: "BYYEEE",
//       VolunteersRequired: 12,
//       VolunteersCount: 10,
//      longitude:73.084488,
//      latitude: 33.738045,
//     eventDurationInDays: eventData.eventDurationInDays
//     });

//     // Save the new event to the database
//     const savedEvent = await newEvent.save();
//     console.log("Event saved successfully:", savedEvent);
//     return savedEvent;
//   } catch (error) {
//     console.error("Error inserting event:", error);
//     throw error;
//   }
// }

// // Example usage:
// const eventData = {
//   EventName: "Example Event",
//   EventDescription: "This is an example event",
//   VolunteersRequired: 10,
//   VolunteersCount: 0,
//   VolunteersIdApplied: [],
//   eventLocationLink: "http://example.com",
//   // Latitude of the event location
//   eventDurationInDays: "3 days"
// };

// insertEvent();

// // async function fetchData(){
// //   try {
// //     let res=await Event.find();
   
// //     let apiResponse=await fetch('https://graphhopper.com/api/1/route?key=29e41d10-adc4-4e1b-97ba-a9e4f5cb473d',{
// //       "points": [
// //         [
// //           res.longitude,
// //           res.latitude
    
// //         ],
// //         [
// //           74.2913491,
// //           31.4465361
// //         ]
// //       ],
// //       "snap_preventions": [
// //         "motorway",
// //         "ferry",
// //         "tunnel"
// //       ],
// //       "details": [
// //         "road_class",
// //         "surface"
// //       ],
// //       "profile": "car",
// //       "locale": "en",
// //       "instructions": true,
// //       "calc_points": true,
// //       "points_encoded": false
// //     })
// //     console.log(apiResponse)
// //     return res.json("fdkmk")
// //   } catch (error) {
    
// //   }
// // }
// // fetchData()


// async function futchData(){
//   try {
//     let res=await Event.find();
//     const url = 'https://graphhopper.com/api/1/route?key=29e41d10-adc4-4e1b-97ba-a9e4f5cb473d';

// const data = {
//   elevation: false,
//   points: [[
//     res[0].longitude,
//     res[0].latitude

//   ],
//   [
//     74.2913491,
//     31.4465361
//   ]],
//   profile: 'car'
// };

// fetch(url, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   body: JSON.stringify(data)
// })
// .then(response => response.json())
// .then(data => {
//   console.log('Response:', data.paths[0].distance);

//   if(data.paths[0].distance>10000){
//     console.log("zyada distance hy")
//   }
// })
// .catch(error => {
//   console.error('Error:', error);
// });
//   } catch (error) {
//     console.log(error)
//   }
// }
// futchData()