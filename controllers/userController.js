const mongoose = require("mongoose"); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

const VerifyCode = require("../models/VerifyCode");
const Conversation = require("../models/Conversation");
const User = require("../models/User");

const { codeSaveDBandMailSend } = require("../utils/func/func");

exports.mainPathGetController = async (req, res, next) => {
	try {
		return res.redirect("/user/messenger");

		const fullName = req.userData.firstName + " " + req.userData.lastName;
		const username = req.userData.username;
		res.render("pages/user-logged-pages/user-main.ejs", { dataPass: { username, fullName } });
	} catch (err) {
		next(err);
	}
};

exports.dashboardGetController = async (req, res, next) => {
	try {
		res.send("Dashboard");
	} catch (err) {
		next(err);
	}
};

exports.emailVerificationGetController = async (req, res, next) => {
	try {
		const userData = req.userData;
		const emailVerifyCodeData = await VerifyCode.findOne({ $and: [{ userObjId: userData._id }, { codeName: "Email_verification_code" }] });

		// If No exist email verification code on Database so saving the verification code to Database and mail sending
		if (!emailVerifyCodeData) {
			const subject = "Email address verification";
			const plainTextMsg = "Enter the following email verify code:";
			const codeName = "Email_verification_code";
			await codeSaveDBandMailSend(userData, subject, plainTextMsg, codeName);
		}

		return res.render("pages/user-logged-pages/email-verification.ejs", { userData });
	} catch (err) {
		next(err);
	}
};

exports.messengerGetController = async (req, res, next) => {
	try {
		const userData = req.userData;

		// Unneccery or Sensitive Data Empty
		userData.password = "";
		userData.othersData.codeSendTimes = "";

		const idFormQueryString = req.query.message;
		const isValidObjId = mongoose.Types.ObjectId.isValid(idFormQueryString);
		const ok = isValidObjId ? await User.find({ _id: idFormQueryString }) : null;

		let lastChattingUserId;
		if (ok) {
			// if redirect from user profile clicked by message button
			lastChattingUserId = idFormQueryString;
		} else {
			// Last chatting user ID getting process and provide in ejs
			let involvedConversations = await Conversation.find({
				$or: [{ creatorObjId: userData._id }, { participantObjId: userData._id }],
			})
				.limit(1)
				.sort({ updatedAt: -1 });

			involvedConversations = involvedConversations[0];

			if (involvedConversations) {
				if (String(involvedConversations.creatorObjId) === String(userData._id)) {
					lastChattingUserId = involvedConversations.participantObjId;
				} else {
					lastChattingUserId = involvedConversations.creatorObjId;
				}
			}
		}

		return res.render("pages/user-logged-pages/messenger.ejs", { userData, lastChattingUserId });
	} catch (err) {
		next(err);
	}
};

exports.settingsGetController = async (req, res, next) => {
	try {
		const userData = req.userData;

		const uri = req.params.uri;

		// Unneccery or Sensitive Data Empty
		userData.password = "";
		userData.othersData.codeSendTimes = "";

		if (uri === undefined || uri === "general-information" || uri === "security" || uri === "social-links") {
			res.render("pages/user-logged-pages/settings.ejs", { userData, uri });
		} else {
			next();
		}
	} catch (err) {
		next(err);
	}
};
