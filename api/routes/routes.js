const routersApi = require("express").Router();

const loginSignupApi = require('./loginSignupApi');
const usersApi = require('./usersApi');

// Middleware loginAuthentication
const { notLogin, isLogin } = require("../../middleware/authentication");

routersApi.use("/ls", notLogin, loginSignupApi); // ls means loginSignup
routersApi.use("/user", isLogin, usersApi);



module.exports = routersApi;