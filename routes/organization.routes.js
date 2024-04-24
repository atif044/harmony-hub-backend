const express = require("express");
const router=express.Router()
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const verifyJwtOrganization=require("../middleware/verifyJwtOrganization");
const {createOrganizationAccount,loginOrganizationAccount,verifyEmailToken,resendOTP, createEvent, allEvents, eventDetails, editEventDetails, checkIfPendingOrApprovedByUniversity} = require("../controllers/organzization-controller/organization.controller");
const { upload } = require("../utils/uploadToCloudinary");
router.route("/createOrganizationAccount").post(checkIfLoggedIn,createOrganizationAccount);
router.route("/loginOrganizationAccount").post(checkIfLoggedIn,loginOrganizationAccount);
router.route('/verifyEmail/:token').post(verifyJwtOrganization,verifyEmailToken);
router.route('/resendEmail').post(verifyJwtOrganization,resendOTP);
router.route('/createEvent').post(verifyJwtOrganization,upload.single('image'),createEvent);
router.route('/allevents').get(verifyJwtOrganization,allEvents)
router.route("/eventdetails/:id").get(verifyJwtOrganization,eventDetails);
router.route('/eventUpdate/:id').post(verifyJwtOrganization,upload.single('image'),editEventDetails);
router.route('/checkIfpending/:id').post(verifyJwtOrganization,checkIfPendingOrApprovedByUniversity);

module.exports=router;