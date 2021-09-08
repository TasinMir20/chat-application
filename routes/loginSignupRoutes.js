const loginSignupRoutes = require("express").Router();



// controller imports
const { loginSignupGetController } = require("../controllers/loginSignupController");


loginSignupRoutes.get("/", loginSignupGetController)
loginSignupRoutes.post("/", loginSignupGetController);


module.exports = loginSignupRoutes;
