const ErrorHandler = require("../config/ErrorHandler");
const User=require('../models/university/university.model')
exports.checkIfUserApprovedByAdmin=async(req,res,next)=>{
    let user=await User.findById(req.userData.user.id);
    if(user.isVerifiedByAdmin==false){
        return next(new ErrorHandler("Not Approved By Admin",400))
      }
      next();
}