const express = require("express");
 const userRouter = require("./routes/user.routes");
 const universityRouter=require('./routes/university.routes.js')
 const organizationRouter=require("./routes/organization.routes.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalError = require("./controllers/error-controller/error.controller");
// const sanitizeInput = require("./middleware/sanitizeInputs");
// const ExpressMongoSanitize = require("express-mongo-sanitize");
const app = express();
require("./database/db.js")();
app.use(cookieParser());
// app.use(ExpressMongoSanitize())
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
// app.use(sanitizeInput)
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/university", universityRouter);
app.use("/api/v1/organization", organizationRouter);
app.use(globalError);
module.exports = app;
