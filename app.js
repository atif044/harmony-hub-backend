const express = require("express");
 const userRouter = require("./routes/user.routes");
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
app.use(globalError);
module.exports = app;
