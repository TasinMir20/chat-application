const usersRoutes = require("express").Router();

// controller imports
const { mainPathGetController, dashboardGetController, emailVerificationGetController, messengerGetController, settingsGetController } = require("../controllers/userController");

usersRoutes.get("/", mainPathGetController);
usersRoutes.get("/dashboard", dashboardGetController);
usersRoutes.get("/email-verification", emailVerificationGetController);
usersRoutes.get("/messenger", messengerGetController);
usersRoutes.get("/settings", settingsGetController);
usersRoutes.get("/settings/:uri", settingsGetController);

module.exports = usersRoutes;
