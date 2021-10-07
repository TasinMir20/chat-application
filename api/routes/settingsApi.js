const settingsApi = require("express").Router();

const { settingsRoot } = require("../controllers/settingsApiController");

settingsApi.post("/a", settingsRoot);





module.exports = settingsApi;