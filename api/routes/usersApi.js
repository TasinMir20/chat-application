const usersApi = require("express").Router();

// controller imports
const { logOut_ApiController, emailVerify_ApiController, emailVerifyResendCode_ApiController, editVerifyEmail_ApiController } = require("../controllers/userApiController");

const messengerApi = require("./messengerApi");
const profileApi = require("./profileApi");
const settingsApi = require("./settingsApi");

usersApi.post("/email-verification", emailVerify_ApiController);
usersApi.post("/email-verification-code-resend", emailVerifyResendCode_ApiController);
usersApi.post("/edit-verify-email", editVerifyEmail_ApiController);

// Logout Api controller
usersApi.get("/logout", logOut_ApiController);
usersApi.post("/logout", logOut_ApiController);

// Messenger router
usersApi.use("/messenger", messengerApi);

// Profile router
usersApi.use("/profile", profileApi);

// Settings router
usersApi.use("/settings", settingsApi);

module.exports = usersApi;
