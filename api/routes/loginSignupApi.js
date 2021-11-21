const loginSignupApi = require("express").Router();
const { signInWithGoogle } = require("../../middleware/signinWithGoogle");

// controller imports
const { signupApiController, loginApiController, forgetPassEmail_ApiController, forgetPassCode_ApiController, forgetPassResendCode_ApiController, forgetPassPassword_ApiController } = require("../controllers/loginSignupApiController");

loginSignupApi.post("/signup", signupApiController);
loginSignupApi.post("/login", signInWithGoogle, loginApiController);

const { recoveryCodeFind } = require("../../middleware/recoveryCodeFind"); // middleware
// Forget APIs routes
loginSignupApi.post("/forget-email-submit", forgetPassEmail_ApiController);
loginSignupApi.post("/forget-code-submit", recoveryCodeFind, forgetPassCode_ApiController);
loginSignupApi.post("/forget-code-resend", recoveryCodeFind, forgetPassResendCode_ApiController);
loginSignupApi.post("/forget-password-submit", recoveryCodeFind, forgetPassPassword_ApiController);

module.exports = loginSignupApi;
