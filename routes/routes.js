const routers = require("express").Router();

const loginSignupRoutes = require("./loginSignupRoutes");
const usersRoutes = require("./usersRoutes");

// Middleware loginAuthentication
const { notLogin, isLogin } = require("../middleware/authentication");

/******* generale routes *******/

routers.get("/", (req, res) => res.redirect("/account"));
routers.post("/", (req, res) => res.redirect("/account"));

// privacy-policy route - START
// controller imports
const { privacyPolicy } = require("../controllers/privacyPolicy");
routers.all("/privacy-policy", privacyPolicy);

// Login, Signup, and forget routes
routers.use("/account", notLogin, loginSignupRoutes);

// User logged in routes
routers.use("/user", isLogin, usersRoutes);

// API routes imports
const routersApi = require("../api/routes/routes");
routers.use("/api", routersApi);

// profile dynamic route
const { profileGetController } = require("../controllers/profileController");
routers.get("/:username", isLogin, profileGetController); // users Profiles

// error handler routes - Start
// controller imports
const { error404Controller, error500Controller } = require("../controllers/errorRouteController");

routers.use(error404Controller);
routers.use(error500Controller);
// error handler routes - End

module.exports = routers;
