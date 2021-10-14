const profileApi = require("express").Router();

const { profilePhotoUpload_ApiController } = require("../controllers/profileApiController");

// Middleware import
const profilePhotoUpload = require("../../middleware/upload-middleware/profilePhotoUpload");


profileApi.post("/profile-photo-upload", profilePhotoUpload, profilePhotoUpload_ApiController);






module.exports = profileApi;