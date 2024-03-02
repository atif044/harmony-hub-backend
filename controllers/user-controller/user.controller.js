const { response } = require('express');
const ErrorHandler = require('../../config/ErrorHandler');
const catchAsyncErrors = require('../../config/catchAsyncErrors');
const Event = require('../../models/event/event.model');
const Token=require('../../models/token/token.model');
const User = require('../../models/user/user.model');
const { uniqueToken } = require('../../utils/generateToken');
const {sendEmail}=require('../email-controller/email.controller');
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