const ErrorHandler = require("../../config/ErrorHandler");
const catchAsyncErrors = require("../../config/catchAsyncErrors");
const University = require("../../models/university/university.model");
const generateJwtUniversity = require("../../utils/generateJwtUniversity");
const Token = require("../../models/token/token.model");
const { hash, compare } = require("bcrypt");
const {uniqueToken}=require("../../utils/generateToken");
const {sendEmail}=require('../email-controller/email.controller');
exports.createUniversityAccount = catchAsyncErrors(async (req, res, next) => {
  const { universityEmial, universityPassword, universityName } = req.body;
  try {
    let universityAccount = await University.find({
      universityEmail: universityEmial,
    });
    if (universityAccount.length === 1) {
      return next(new ErrorHandler("Account Already Exists", 400));
    }

    let hashedPassword = await hash(universityPassword, 10);
    if (hashedPassword) {
      let account = await University.create({
        universityName,
        universityEmail: universityEmial,
        universityPassword: hashedPassword,
      });
      await account.save();
      const data = {
        user: {
          id: account._id,
          email: account.universityEmail,
        },
      };
      const authToken = generateJwtUniversity(data);
      res.cookie("harmony-hub-university", authToken, {
        secure: false,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.cookie("isApproved", account.isApproved, {
        secure: false,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      const emailVerificationToken = uniqueToken(5);
      const token = new Token({
        email: account.universityEmail,
        token: emailVerificationToken,
        tokenType: "emailVerification",
        tokenExpiry: new Date(Date.now()), // 1 hour
      });
      await token.save();
      await sendEmail(
        account.universityEmail,
        "Email Verification",
        `Your One Time Password(OTP) is ${emailVerificationToken}`
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

exports.loginUniversityAccount = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const response = await University.find({ universityEmail: email });
    if (response.length === 0) {
      return next(new ErrorHandler("Email or Password is Incorrect", 400));
    }
    let passwordCompare = await compare(password, response.universityPassword);
    if (!passwordCompare) {
      return next(new ErrorHandler("Email or password is incorrect", 400));
    }
    const authToken = generateJwtUniversity(data);
    res.cookie("harmony-hub-university", authToken, {
      secure: false,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.cookie("isApproved", account.isApproved, {
      secure: false,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res.status(200).json({
      status:"success",message:"Logged in successfully",body:authToken
    })
  } catch (error) {
    return next(
      new ErrorHandler(error.message, error.code || error.statusCode)
    );
  } finally {
    req.body = null;
  }
});
