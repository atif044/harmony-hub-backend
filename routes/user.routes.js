const express = require("express");
const router=express.Router()
const authController=require('../controllers/auth-controller/auth.controller');
const userController=require('../controllers/user-controller/user.controller');
const validatorSignup = require("../validator/sigup.validator");
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const loginValidator = require("../validator/login.validator");
const verifyJwt = require("../middleware/verifyJwt");
//================================AUTHENTICATION USER
router.route("/register").post(checkIfLoggedIn,validatorSignup,authController.signupController);
router.route("/login").post(checkIfLoggedIn,loginValidator,authController.loginController);
//===============================USER ACTIONS
router.route('/verifyEmail/:token').post(userController.verifyEmailToken);
router.route('/resendEmail').post(verifyJwt,userController.resendOTP);
module.exports=router;
