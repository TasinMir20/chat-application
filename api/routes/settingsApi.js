const settingsApi = require("express").Router();

const { settingsRoot_ApiController, generalInfoUpdate_ApiController, security_ApiController } = require("../controllers/settingsApiController");

settingsApi.post("/", settingsRoot_ApiController);
settingsApi.post("/general-information-edit", generalInfoUpdate_ApiController);
settingsApi.post("/security", security_ApiController);





module.exports = settingsApi;