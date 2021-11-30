// const mongoose = require('mongoose'); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

// const Conversation = require("../models/Conversation");
const User = require("../models/User");

exports.profileGetController = async (req, res, next) => {
	try {
		const userData = req.userData;
		// Unneccery or Sensitive Data Empty
		userData.password = "";
		userData.othersData.codeSendTimes = "";

		const requestedProfileUsername = req.params.username;

		let requestedProfileData = await User.findOne({ username: requestedProfileUsername });

		if (requestedProfileData) {
			// Unneccery or Sensitive Data Empty
			requestedProfileData.password = "";
			requestedProfileData.othersData.codeSendTimes = "";

			// Make profile pic right path
			requestedProfileData.othersData.profilePicPathName = requestedProfileData.othersData.profilePicPath ? `${requestedProfileData.othersData.profilePicPath}${requestedProfileData.othersData.profilePic}` : requestedProfileData.othersData.profilePic;

			return res.render("pages/user-logged-pages/profile.ejs", { userData, requestedProfileData });
		} else {
			return next();
		}
	} catch (err) {
		next(err);
	}
};
