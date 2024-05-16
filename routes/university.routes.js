const express = require("express");
const router=express.Router()
const verifyJwtUniversity=require('../middleware/verifyJwtUniversity');
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const {
createUniversityAccount,
resendOTP,
verifyEmailToken,
loginUniversityAccount,
getAllUniversities,
getAllPendingEvents,
eventDetails,
approveEvent,
getAllCollaboratedEvents,
getAllApprovedAndUnApprovedStudents,
getUserProfile,
approveTheStudent,
rejectTheStudent,
approveToReject,
rejectToApprove
}=require('../controllers/university-controller/univsersity.controller');
router.route("/createuniversityaccount").post(checkIfLoggedIn,createUniversityAccount);
router.route("/loginuniversityaccount").post(checkIfLoggedIn,loginUniversityAccount);
router.route("/verifyotpuniversity/:token").post(verifyJwtUniversity,verifyEmailToken);
router.route("/resendotpuniversity").post(verifyJwtUniversity,resendOTP);
router.route("/getalluniversities").get(getAllUniversities);
router.route('/getAllPendingEvents').get(verifyJwtUniversity,getAllPendingEvents);
router.route('/eventDetail/:id').get(verifyJwtUniversity,eventDetails);
router.route("/approveEvent/:id").post(verifyJwtUniversity,approveEvent);
router.route('/getAllColloabEvents').get(verifyJwtUniversity,getAllCollaboratedEvents);
router.route('/getAllStudents').get(verifyJwtUniversity,getAllApprovedAndUnApprovedStudents);
router.route("/getUserProfile/:id").get(verifyJwtUniversity,getUserProfile);
router.route('/approveTheStudent/:id').post(verifyJwtUniversity,approveTheStudent)
router.route('/rejectTheStudent/:id').post(verifyJwtUniversity,rejectTheStudent)
router.route('/approveToRejectTheStudent/:id').post(verifyJwtUniversity,approveToReject)
router.route('/rejectToApproveTheStudent/:id').post(verifyJwtUniversity,rejectToApprove)
module.exports=router;