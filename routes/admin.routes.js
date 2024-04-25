const express = require("express");
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const { createAdminAccount, loginAdminAccount, getAllUnApprovedUserAccounts, getAllApprovedUserAccounts, getUserProfile, approveTheVolunteerAccount, disapproveTheVolunteerAccount } = require("../controllers/admin-controller/admin.controller");
const verifyJwt = require("../middleware/verifyJwtAdmin");
const router=express.Router()

//================================AUTHENTICATION USER
router.route("/signupAdmin").post(checkIfLoggedIn,createAdminAccount);
router.route("/loginAdmin").post(checkIfLoggedIn,loginAdminAccount);
router.route("/getAllUnapprovedVolunteerProfiles").get(verifyJwt,getAllUnApprovedUserAccounts);
router.route("/getAllApprovedVolunteerProfiles").get(verifyJwt,getAllApprovedUserAccounts);
router.route("/getUserProfile/:id").get(verifyJwt,getUserProfile);
router.route("/approveTheUser/:id").post(verifyJwt,approveTheVolunteerAccount);
router.route("/disapproveTheUser/:id").post(verifyJwt,disapproveTheVolunteerAccount);
module.exports=router;
