const profileApi = require("express").Router();

const { profileRoot } = require("../controllers/profileApiController");

profileApi.post("/a", profileRoot);





module.exports = profileApi;