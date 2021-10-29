const User = require("../../models/User");
const LoginCookie = require("../../models/LoginCooke");
const VerifyCode = require("../../models/VerifyCode");

const { codeResendTimeInSeconds, codeSaveDBandMailSend } = require("../../utils/func/func");

exports.logOut_ApiController = async (req, res, next) => {
	try {
		const loginCookie = req.cookies.access_l;
		const LoginCookieDelete = await LoginCookie.deleteOne({ cookieVal: loginCookie });

		if (LoginCookieDelete.deletedCount === 1) {
			res.clearCookie("access_l");

			if (req.method === "GET") {
				return res.redirect("/account");
			} else {
				return res.json({ logout: true });
			}
		} else {
			throw new Error("Failed to Delete cookie from Database");
		}
	} catch (err) {
		next(err);
	}
};

// email Verify APIs controllers >> Start
exports.emailVerify_ApiController = async (req, res, next) => {
	let { userEnteredCode } = req.body;

	try {
		userEnteredCode = !!userEnteredCode ? String(userEnteredCode).trim() : false;

		if (userEnteredCode) {
			const userData = req.userData;

			const emailVerifyCodeData = await VerifyCode.findOne({ $and: [{ userObjId: userData._id }, { codeName: "Email_verification_code" }] });
			req.email_verify_code = emailVerifyCodeData;

			const currentEpochTime = Math.floor(new Date().getTime() / 1000);

			if (emailVerifyCodeData.expireTime > currentEpochTime) {
				if (emailVerifyCodeData.wrongTryTime <= 4) {
					if (emailVerifyCodeData.theCode === userEnteredCode) {
						await User.updateOne({ _id: userData._id }, { "othersData.emailVerified": true });
						await VerifyCode.updateOne({ _id: emailVerifyCodeData._id }, { used: true });
						await VerifyCode.deleteOne({ _id: emailVerifyCodeData._id });
						var codeMatched = true;
					} else {
						await VerifyCode.updateOne({ _id: emailVerifyCodeData._id }, { wrongTryTime: emailVerifyCodeData.wrongTryTime + 1 });
						var codeMsg = "You have entered wrong code!";
					}
				} else {
					codeMsg = "You tried a lot time with wrong code! Try again later.";
				}
			} else {
				codeMsg = "The code is expired.";
			}
		} else {
			codeMsg = "Please enter the verification code that you received recently.";
		}

		res.json({ codeMatched, codeMsg });
	} catch (err) {
		next(err);
	}
};

exports.emailVerifyResendCode_ApiController = async (req, res, next) => {
	try {
		const user = req.userData;
		const emailVerifyCodeData = await VerifyCode.findOne({ $and: [{ userObjId: user._id }, { codeName: "Email_verification_code" }] });

		if (emailVerifyCodeData) {
			// Resend code limitation
			const currentTime = Math.floor(new Date().getTime() / 1000);
			const zeroTime = user.othersData.codeSendTimes.email_verify_code == 0;
			const oneTime = user.othersData.codeSendTimes.email_verify_code == 1 && emailVerifyCodeData.codeCreateTime + 60 < currentTime;
			const twoTimes = user.othersData.codeSendTimes.email_verify_code == 2 && emailVerifyCodeData.codeCreateTime + 120 < currentTime;
			const threeTimes = user.othersData.codeSendTimes.email_verify_code == 3 && emailVerifyCodeData.codeCreateTime + 180 < currentTime;
			const fourTimes = user.othersData.codeSendTimes.email_verify_code >= 4 && emailVerifyCodeData.codeCreateTime + 43200 < currentTime;

			const codeResendAvailable = zeroTime || oneTime || twoTimes || threeTimes || fourTimes;

			if (codeResendAvailable) {
				// before send new verification code, delete old verification code from database
				await VerifyCode.deleteMany({ $and: [{ userObjId: user._id }, { codeName: "Email_verification_code" }] });

				// saving the verification code to Database and mail sending
				const subject = "Email address verification";
				const plainTextMsg = "Enter the following email verify code:";
				const codeName = "Email_verification_code";
				const mail = (await codeSaveDBandMailSend(user, subject, plainTextMsg, codeName)) || {};

				if (mail.accepted) {
					const { saveCodeData } = mail;

					if (fourTimes) {
						// after 12 hours again get 3 time chance to resend verification code so `User-othersData.codeSendTimes.email_verify_code` value have to be 0
						await User.updateOne({ _id: user._id }, { "othersData.codeSendTimes.email_verify_code": 0 });
					} else {
						// counting that how many times resend verification code
						await User.updateOne({ _id: user._id }, { "othersData.codeSendTimes.email_verify_code": user.othersData.codeSendTimes.email_verify_code + 1 });
					}

					const userData = await User.findOne({ _id: user._id });

					// Verification code resend করতে পারবে কত সময় পরে সেই seconds গুলো front এ পাঠানো
					const seconds = codeResendTimeInSeconds(userData, saveCodeData);

					return res.json({ codeResend: true, seconds });
				} else {
					throw new Error("Failed to resend email verification code");
				}
			} else {
				// Verification code resend করতে পারবে কত সময় পরে সেই seconds গুলো front এ পাঠানো
				const seconds = codeResendTimeInSeconds(user, emailVerifyCodeData);
				return res.json({ resendTurnsNotAvailable: "yes", seconds });
			}
		} else {
			return res.json({ rld: true });
		}
	} catch (err) {
		next(err);
	}
};

// email Verify APIs controllers >> End
