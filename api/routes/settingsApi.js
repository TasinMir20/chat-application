const settingsApi = require("express").Router();

const { settingsRoot_ApiController, generalInfoUpdate_ApiController, security_ApiController, socialLinksUpdate_ApiController } = require("../controllers/settingsApiController");

settingsApi.post("/", settingsRoot_ApiController);
settingsApi.post("/general-information-update", generalInfoUpdate_ApiController);
settingsApi.post("/security", security_ApiController);
settingsApi.post("/social-link-update", socialLinksUpdate_ApiController);

module.exports = settingsApi;
