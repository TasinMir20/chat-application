const usersApi = require("express").Router();

// controller imports
const { mainPathApiController, dashboardApiController, logOut_ApiController, emailVerify_ApiController, emailVerifyResendCode_ApiController } = require("../controllers/userApiController");
const messenger = require("./messengerApi");

usersApi.post("/", mainPathApiController);
usersApi.post("/dashboard", dashboardApiController);
usersApi.post("/email-verification", emailVerify_ApiController);
usersApi.post("/email-verification-code-resend", emailVerifyResendCode_ApiController);


// Logout Api controller
usersApi.get("/logout", logOut_ApiController);
usersApi.post("/logout", logOut_ApiController);

// Messenger router
usersApi.use("/messenger", messenger);


module.exports = usersApi;
