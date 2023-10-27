const ErrorHandler = require("../config/ErrorHandler")
exports.checkIfLoggedIn=(req,res,next)=>{
    if(req.cookies['harmony-hub']){
        return next(new ErrorHandler("Already Logged in",400))
      }
      next()
}