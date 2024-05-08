const express = require("express");
const router=express.Router()
const authController=require('../controllers/auth-controller/auth.controller');
const userController=require('../controllers/user-controller/user.controller');
const validatorSignup = require("../validator/sigup.validator");
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const loginValidator = require("../validator/login.validator");
const { upload } = require("../utils/uploadToCloudinary");
const verifyJwt = require("../middleware/verifyJwt");
//================================AUTHENTICATION USER
router.route("/register").post(checkIfLoggedIn,upload.array("photos",3),userController.createUserAccount);
router.route("/login").post(checkIfLoggedIn,userController.loginUserAccount);
//===============================USER ACTIONS
router.route('/verifyEmail/:token').post(userController.verifyEmailToken);
router.route('/resendEmail').post(verifyJwt,userController.resendOTP);
router.route("/getAllEvents").get(verifyJwt,userController.findAllEventsInCountry);
router.route("/getEvent/:id").get(verifyJwt,userController.eventDetails);
router.route("/joinEvent").post(verifyJwt,userController.joinEvent);
router.route("/getMyPendingEvents").get(verifyJwt,userController.fetchMyAppliedEventsPending);
router.route("/getMyAcceptedEvents").get(verifyJwt,userController.fetchMyAppliedEventsAccepted);
router.route("/getMyAttendance/:id").get(verifyJwt,userController.getMyAttendanceForParticularEvent);
router.route("/requestCertificate/:id").post(verifyJwt,userController.requestForCertificate);
module.exports=router;
