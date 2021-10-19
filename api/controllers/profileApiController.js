const fs = require("fs");
const path = require("path");
const User = require("../../models/User");

exports.profilePhotoUpload_ApiController = async (req, res, next) => {
	try {
		const userData = req.userData;
		const uploadedProfilePhotoName = String(req.files[0].filename);

		const a = ["default_profile_pic.png", "not-exist_profile_pic.jpg"].includes(userData.othersData.profilePic);
		if (!a) {
			// Delete old profile photo from server
			const deletePath = `${path.resolve("./")}/public/images/users/profile-photo/${userData.othersData.profilePic}`;
			if (fs.existsSync(deletePath)) {
				fs.unlinkSync(deletePath);
			}
		}

		// profile photo name update on database
		const profilePhotoNameUpdate = await User.updateOne({ _id: userData._id }, { "othersData.profilePic": uploadedProfilePhotoName });

		if (profilePhotoNameUpdate.nModified) {
			return res.json({ upload: "Profile photo upload successful", uploadedProfilePhotoName });
		}
	} catch (err) {
		next(err);
	}
};
