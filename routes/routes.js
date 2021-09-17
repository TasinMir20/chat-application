const routers = require("express").Router();


const loginSignupRoutes = require('./loginSignupRoutes');
const usersRoutes = require('./usersRoutes');


// Middleware loginAuthentication
const { notLogin, isLogin } = require("../middleware/authentication");



/******* generale routes *******/

routers.get("/", (req, res) => res.redirect("/account"));
routers.post("/", (req, res) => res.redirect("/account"));

// Login, Signup, and forget routes
routers.use("/account", notLogin, loginSignupRoutes);

// User after logged routes
routers.use("/user", isLogin, usersRoutes);

 

// API routes imports
const routersApi = require('../api/routes/routes');
routers.use("/api", routersApi);



// error handler routes - Start
// controller imports
const { error404Controller, error500Controller } = require('../controllers/errorRouteController');

routers.use(error404Controller);
routers.use(error500Controller);
// error handler routes - End



module.exports = routers;