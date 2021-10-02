const routersApi = require("express").Router();

const loginSignupApi = require('./loginSignupApi');
const usersApi = require('./usersApi');

// Middleware imports 
const { notLogin, isLogin } = require("../../middleware/authentication"); // loginAuthentication middleware
const { userAgentParse } = require('../../middleware/parser'); // User agent parser middleware --> this need to create a new login cookie

// User before login API
routersApi.use("/ls", notLogin, userAgentParse, loginSignupApi); // ls means loginSignup

// User logged in API
routersApi.use("/user", isLogin, usersApi);



module.exports = routersApi;