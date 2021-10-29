const settingsApi = require("express").Router();

const { generalInfoUpdate_ApiController, securityPassUpdate_ApiController, logoutFromLoggedDevices_ApiController, socialLinksUpdate_ApiController } = require("../controllers/settingsApiController");

settingsApi.post("/general-information-update", generalInfoUpdate_ApiController);
settingsApi.post("/security-password-update", securityPassUpdate_ApiController);
settingsApi.post("/logout-from-logged-devices", logoutFromLoggedDevices_ApiController);
settingsApi.post("/social-link-update", socialLinksUpdate_ApiController);

module.exports = settingsApi;
