const User = require("../models/User");
const { auth } = require("../utils/func/func"); // authentication processing function

exports.notLogin = async (req, res, next) => {
	try {
		const request = req;
		const response = res;
		const access = await auth(request, response);

		if (access.accessible) {
			return res.redirect("/user");
		} else {
			next();
		}
	} catch (err) {
		next(err);
	}
};

exports.isLogin = async (req, res, next) => {
	try {
		const request = req;
		const response = res;
		const access = await auth(request, response);

		if (access.accessible) {
			const userData = request.userData;
			const currentEpochTime = Math.floor(new Date().getTime() / 1000);
			// user last server request time update
			await User.updateOne({ _id: userData._id }, { "othersData.lastServerReq": currentEpochTime });

			const requestRoute = req.originalUrl;
			const isLoggedApi = requestRoute.slice(0, 10) === "/api/user/";

			if (isLoggedApi) {
				next();
			} else if (access.emailVerified && req.originalUrl === "/user/email-verification") {
				return res.redirect("/user");
			} else if (!access.emailVerified && req.originalUrl !== "/user/email-verification") {
				return res.redirect("/user/email-verification");
			} else {
				next();
			}
		} else {
			return res.redirect("/account");
		}
	} catch (err) {
		next(err);
	}
};
