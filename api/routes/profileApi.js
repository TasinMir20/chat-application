const profile = require("express").Router();

const { profileRoot } = require("../controllers/profileApiController");

profile.get("/a", profileRoot);





module.exports = profile;