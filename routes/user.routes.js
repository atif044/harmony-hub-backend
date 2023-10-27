const express = require("express");
const router=express.Router()
const authController=require('../controllers/auth-controller/auth.controller');
const validatorSignup = require("../validator/sigup.validator");
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
router.route("/register").post(checkIfLoggedIn,validatorSignup,authController.signupController);
router.route("/login").post(checkIfLoggedIn,authController.loginController);
module.exports=router;