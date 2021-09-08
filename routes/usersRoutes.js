const usersRoutes = require("express").Router();

// controller imports
const { mainPathController, dashboardController, emailVerification, messenger } = require("../controllers/userController");



usersRoutes.get("/", mainPathController);
usersRoutes.get("/dashboard", dashboardController);
usersRoutes.get("/email-verification", emailVerification);
usersRoutes.get("/messenger", messenger);




module.exports = usersRoutes;
