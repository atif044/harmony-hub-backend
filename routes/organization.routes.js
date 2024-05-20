const cron = require('node-cron');

const { changeEventsStatus,changeEventToEnd,pullFromCurrentEventsAndPushToPastEvents } = require('../controllers/automated-api-controller/automated.api.controller'); // Import your controller function
const express = require("express");
const router=express.Router()
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");
const verifyJwtOrganization=require("../middleware/verifyJwtOrganization");
const {createOrganizationAccount,loginOrganizationAccount,verifyEmailToken,resendOTP, createEvent, allEvents, eventDetails, editEventDetails, checkIfPendingOrApprovedByUniversity, findAllPendingAcceptedAndRejectedVolunteers, acceptTheVolunteer, rejectTheVolunteer, FromAcceptTorejectTheVolunteer, FromRejectToAcceptTheVolunteer, getVolunteersByEvent, markAttendance, getAttendance, getAttendeesByDate, editAttendanceByDate, allEventsStarted, allEventsEnded, checkTheStatusOfEvent, changeEventStatus, endEvent, getAllVolunteers, reviewVolunteer, getMyProfile, getMyPublicProfile, addBio, addProfilePic} = require("../controllers/organzization-controller/organization.controller");
const { upload } = require("../utils/uploadToCloudinary");
router.route("/createOrganizationAccount").post(checkIfLoggedIn,createOrganizationAccount);
router.route("/loginOrganizationAccount").post(checkIfLoggedIn,loginOrganizationAccount);
router.route('/verifyEmail/:token').post(verifyJwtOrganization,verifyEmailToken);
router.route('/resendEmail').post(verifyJwtOrganization,resendOTP);
router.route('/createEvent').post(verifyJwtOrganization,upload.single('image'),createEvent);
router.route('/allevents').get(verifyJwtOrganization,allEvents)
router.route('/alleventsStarted').get(verifyJwtOrganization,allEventsStarted)
router.route('/alleventsEnded').get(verifyJwtOrganization,allEventsEnded)
router.route("/eventdetails/:id").get(verifyJwtOrganization,eventDetails);
router.route('/eventUpdate/:id').post(verifyJwtOrganization,upload.single('image'),editEventDetails);
router.route('/checkIfpending/:id').post(verifyJwtOrganization,checkIfPendingOrApprovedByUniversity);
router.route("/fetchVolunteersForApproval/:id").get(verifyJwtOrganization,findAllPendingAcceptedAndRejectedVolunteers);
router.route("/acceptTheVolunteer").post(verifyJwtOrganization,acceptTheVolunteer);
router.route("/rejectTheVolunteer").post(verifyJwtOrganization,rejectTheVolunteer);
router.route("/acceptTorejectTheVolunteer").post(verifyJwtOrganization,FromAcceptTorejectTheVolunteer);
router.route("/rejectToAcceptTheVolunteer").post(verifyJwtOrganization,FromRejectToAcceptTheVolunteer);
router.route("/getEventVolunteers/:id").get(verifyJwtOrganization,getVolunteersByEvent);
router.route("/markAttendance/:id").post(verifyJwtOrganization,markAttendance);
router.route("/getAttendance/:id").get(verifyJwtOrganization,getAttendance);
router.route("/getAttendeesByDate/:id").post(verifyJwtOrganization,getAttendeesByDate);
router.route("/editAttendanceByDate/:id").post(verifyJwtOrganization,editAttendanceByDate);
router.route("/checkTheStatusOfEvent/:id").get(verifyJwtOrganization,checkTheStatusOfEvent);
router.route("/changeTheStatusOfEvent/:id").get(verifyJwtOrganization,changeEventStatus);
router.route("/endEvent/:id").post(verifyJwtOrganization,endEvent);
router.route("/getAllVolunteer/:id").get(verifyJwtOrganization,getAllVolunteers)
router.route("/reviewVolunteer/:eventId").post(verifyJwtOrganization,reviewVolunteer)
router.route("/getMyProfile").get(verifyJwtOrganization,getMyProfile)
router.route("/getMyPublicProfile/:id").get(getMyPublicProfile);
router.route("/addBio").post(verifyJwtOrganization,addBio);
router.route("/addPP").post(verifyJwtOrganization,upload.single("image"),addProfilePic)
// // Define your cron schedule (runs every minute)
// cron.schedule('*/5 * * * * *', async () => {
//     try {
//         // Call your controller function
//          changeEventsStatus();
//          changeEventToEnd();
// pullFromCurrentEventsAndPushToPastEvents()
         

//         // Log success message
//         console.log('Controller function executed successfully.');
//     } catch (error) {
//         // Handle errors
//         console.error('Error executing controller function:', error);
//     }
// }, {
//     scheduled: true,
//     timezone: "Asia/Karachi" // Set timezone to Pakistan (Asia/Karachi)

// });
// changeEventsStatus()
// console.log('Cron job scheduled to run every minute.');
console.log(new Date())
module.exports=router;