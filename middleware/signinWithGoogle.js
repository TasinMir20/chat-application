const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { usernameGenerating, doLogin } = require("../utils/func/func");

exports.signInWithGoogle = (req, res, next) => {
	let { id_token } = req.body;
	try {
		if (id_token) {
			const { id_token } = req.body;
			const CLIENT_ID = process.env.SIGN_IN_WITH_GOOGLE_CLIENT_ID;
			const client = new OAuth2Client(CLIENT_ID);

			async function verify() {
				const ticket = await client.verifyIdToken({
					idToken: id_token,
					audience: CLIENT_ID,
				});

				const payload = ticket.getPayload();
				const { email, email_verified, picture, given_name: firstName, family_name: lastName, iat: tokenCreateTime, exp: tokenExpireTime } = payload;

				if (email_verified) {
					const currentEpochTime = Math.floor(new Date().getTime() / 1000);
					if (tokenExpireTime > currentEpochTime) {
						const userExist = await User.findOne({ email });
						let keepLogged = true;
						if (userExist) {
							// if email is not verify in previous time so with Google sign in make its email verified
							if (userExist.othersData.emailVerified === false) {
								await User.updateOne({ email: userExist.email }, { "othersData.emailVerified": true });
							}

							// Login process
							const request = req;
							const response = res;
							const nxt = next;
							var loginSuccess = await doLogin(request, response, nxt, userExist, keepLogged);
							var msg = "You're successfully Logged in.";
						} else {
							// Do register with the Google api data
							const username = await usernameGenerating(email); /* username generating */
							const currentEpochTime = Math.floor(new Date().getTime() / 1000);
							const userInsertStructure = new User({
								firstName,
								lastName,
								username,
								email,
								password: " ",
								othersData: {
									userCreateTime: currentEpochTime,
									profilePic: picture,
									lastOnlineTime: currentEpochTime,
									lastServerReq: currentEpochTime,
									keyWord: `${firstName} ${lastName}`,
									emailVerified: true,
									codeSendTimes: {
										email_verify_code: 0,
										recovery_code: 0,
									},
								},
							});

							const saveUserData = await userInsertStructure.save();

							if (saveUserData) {
								// Login process
								const request = req;
								const response = res;
								const nxt = next;
								const keepLogged = true;
								loginSuccess = await doLogin(request, response, nxt, saveUserData, keepLogged);
								msg = "Account created successfully";
							}
						}
					} else {
						var authMsg = "Token expired";
					}
				} else {
					authMsg = "You are not authenticated by Google";
				}
				return res.json({ loginSuccess, msg, authMsg });
			}
			verify().catch((err) => {
				console.log(err);
				return res.json({ authMsg: "Failed to Google authentication" });
			});
		} else {
			return next();
		}
	} catch (err) {
		next(err);
	}
};
