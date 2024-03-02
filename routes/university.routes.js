const express = require("express");
const router=express.Router()
const verifyJwtUniversity=require('../middleware/verifyJwtUniversity');
const { checkIfLoggedIn } = require("../middleware/checkIfAlreadyLoggedIn");

const {
createUniversityAccount, loginUniversityAccount
}=require('../controllers/university-controller/univsersity.controller');
const { createOrganizationAccount } = require("../controllers/organzization-controller/organization.controller");
router.route("/createAccount").post(checkIfLoggedIn,createUniversityAccount);
router.route("/loginAccount").post(checkIfLoggedIn,loginUniversityAccount);
router.route("/org").post(createOrganizationAccount)




module.exports=router;