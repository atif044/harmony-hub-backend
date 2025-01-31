const jwt = require("jsonwebtoken");
const ErrorHandler = require("../config/ErrorHandler");
const verifyJwt = (req, res, next) => {
  try {
    const authToken =
      req.cookies["harmony-hub-volunteer"]
    if (!authToken) {
      return next(new ErrorHandler("You are UnAuthorized",403))
    }
    const data = jwt.verify(authToken, process.env.JWT_SIGNATURE);
    if (data !== undefined) {
      req.userData = data;
    }
    return next();
  } catch (error) {
    if (error.name==='TokenExpiredError') {
      res.clearCookie("local-stories", {
        path: "/",
      });
      return next(new ErrorHandler("Jwt has Expired Please log in Again",401))
    }
    return next(new ErrorHandler("Invalid jwt",403))
  }
};

module.exports = verifyJwt;
