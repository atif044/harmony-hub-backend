const ErrorHandler = require('../../config/ErrorHandler');
const catchAsyncErrors = require('../../config/catchAsyncErrors');
const Admin=require('../../models/admin/admin.model');
const bcrypt=require("bcrypt");
const generateJwtAdmin = require('../../utils/generateJwtAdmin');
const User = require('../../models/user/user.model');

exports.createAdminAccount=catchAsyncErrors(async(req,res,next)=>{
    let {name,email,password}=req.body;
    try {
        let user=await Admin.findOne({email:email});
        if(user){
            return next(new ErrorHandler("Account Already Exists",400));
        }
        let hashedPassword=await bcrypt.hash(password,10);
        if(!hashedPassword){
            return next(new ErrorHandler("Error Hashing Your Password",400));
        }
        let account=await Admin.create(
            {
                name,
                email,
                password:hashedPassword
            }
        )
        await account.save();
        const data = {
            user: {
              id: account._id,
              email: account.email,
            },
          };
        const authToken=generateJwtAdmin(data);
        res.cookie("harmony-hub-admin", authToken, {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
          return res.status(201).json({
            status: "success",
            message: "Successfully Signed Up",
            body: authToken,
          });

        
    } catch (error) {
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
});

exports.loginAdminAccount=catchAsyncErrors(async(req,res,next)=>{
    let {email,password}=req.body;
    try {
        let user=await Admin.findOne({email:email});
        if(!user){
            return next(new ErrorHandler("Email or Password is incorrect",400));
        }
        let passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return next(new ErrorHandler("Email or Password is incorrect",400));
        }
        const data = {
            user: {
              id: user._id,
              email: user.email,
            },
          };
        const authToken=generateJwtAdmin(data);
        res.cookie("harmony-hub-admin", authToken, {
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
          return res.status(200).json({
            status: "success",
            message: "Successfully Logged In",
            body: authToken,
          });
    } catch (error) {
        return next(new ErrorHandler(error.message, error.code || error.statusCode));
    }
});

exports.getAllUnApprovedUserAccounts=catchAsyncErrors(async(req,res,next)=>{
  try {
    let users=await User.find({isVerifiedByAdmin:false});
    return res.status(200).json({
      status:"success",
      body:users
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.getAllApprovedUserAccounts=catchAsyncErrors(async(req,res,next)=>{
  try {
    let users=await User.find({isVerifiedByAdmin:true});
    return res.status(200).json({
      status:"success",
      body:users
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.getUserProfile=catchAsyncErrors(async(req,res,next)=>{
  const id=req.params.id;
  try {
    let user=await User.findOne({_id:id}).select("-password").populate("universityId");
    if(!user){
      return next(new ErrorHandler("No Such User Found",400));
    }
    return res.status(200).json({
      status:"success",
      body:user
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});

exports.approveTheVolunteerAccount=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let user=await User.findById(id);
    if(!user){
      return next(new ErrorHandler("No Account Exists on this Id",400));
    }
    if(user.isVerifiedByAdmin===true){
      return next(new ErrorHandler("This Account is already Approved",400));
    }
    user.isVerifiedByAdmin=true;
    await user.save();
    return res.status(200).json({
      status:"success",
      message:"User Approved Successfully"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
});
exports.disapproveTheVolunteerAccount=catchAsyncErrors(async(req,res,next)=>{
  let id=req.params.id;
  try {
    let user=await User.findById(id);
    if(!user){
      return next(new ErrorHandler("No Account Exists on this Id",400));
    }
    if(user.isVerifiedByAdmin===false){
      return next(new ErrorHandler("This Account is already not approved",400));
    }
    user.isVerifiedByAdmin=false;
    await user.save();
    return res.status(200).json({
      status:"success",
      message:"User disapproved Successfully"
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, error.code || error.statusCode));
  }
})