const bcrypt = require("bcrypt");
const User = require("../../models/User");
const LoginCookie = require("../../models/LoginCooke");

const { worstPasswordCheck, emailValidation, codeSaveDBandMailSend, mailSending } = require("../../utils/func/func");
const mongoose = require("mongoose"); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

exports.settingsRoot_ApiController = async (req, res, next) => {
	try {
		res.send("settings Root");
	} catch (err) {
		next(err);
	}
};

exports.generalInfoUpdate_ApiController = async (req, res, next) => {
	try {
		const userData = req.userData;

		let { firstName, lastName, username, email, authPassword, whichPropertyChange } = req.body;

		firstName = !!firstName ? String(firstName).trim() : false;
		lastName = !!lastName ? String(lastName).trim() : false;
		username = !!username ? String(username).toLowerCase().trim() : false;
		email = !!email ? String(email).toLowerCase().trim() : false;
		authPassword = !!authPassword ? String(authPassword) : false;

		if (whichPropertyChange == "name") {
			// Check filled or not
			const fstNmF = firstName.length > 0;
			const lstNmF = lastName.length > 0;

			// First name validation
			const letters = /^[A-Za-z]+$/;

			const fnmLng = firstName.length <= 46 && firstName.length >= 3;
			const fNameLettersValid = firstName ? !!firstName.match(letters) : false;
			const fNameOk = fstNmF && fnmLng && fNameLettersValid ? true : false;

			// Last name validation
			const lnmLng = lastName.length <= 46 && lastName.length >= 2;
			const lNameLettersValid = lastName ? !!lastName.match(letters) : false;
			const lNameOk = lstNmF && lnmLng && lNameLettersValid ? true : false;

			if (fNameOk && lNameOk) {
				const invalidChangeReq = userData.firstName == firstName && userData.lastName == lastName;

				if (!invalidChangeReq) {
					const currentEpochTime = Math.floor(new Date().getTime() / 1000);
					const day = 30;
					const nameChangePeriod = 86400 * day;
					const nameChangeAble = userData.othersData.nameLastChange + nameChangePeriod < currentEpochTime;

					if (userData.othersData.nameLastChange === 0 || nameChangeAble) {
						const nameUpdate = await User.updateOne({ _id: userData._id }, { firstName, lastName, "othersData.nameLastChange": currentEpochTime });

						if (nameUpdate.nModified == 1) {
							const theUpdatedName = { firstName, lastName };
							return res.json({ whichPropertyChange, nameUpdated: "Your name has been updated successfully", theUpdatedName });
						}
					} else {
						var nameMsg = "Unable to change name!";
					}
				} else {
					var nameMsg = "First make change in input box then try!";
				}
			} else {
				if (!fNameOk) {
					if (!fstNmF) {
						var firstNameMsg = "You must have a first name!";
					} else if (!fnmLng) {
						firstNameMsg = "First name could be 3 to 46 characters long!";
					} else if (!fNameLettersValid) {
						firstNameMsg = "Please enter valid name";
					}
				}

				if (!lNameOk) {
					if (!lstNmF) {
						var lastNameMsg = "You must have a last name!";
					} else if (!lnmLng) {
						lastNameMsg = "Last name could be 2 to 46 characters long";
					} else if (!lNameLettersValid) {
						lastNameMsg = "Please enter valid name";
					}
				}
			}

			return res.json({ whichPropertyChange, firstNameMsg, lastNameMsg, nameMsg });
		} else if (whichPropertyChange == "username") {
			// Check filled or not
			const usernameF = username.length > 0;

			// username validation
			const isUsrNmNotNumr = String(Number(username)) === "NaN";
			const validChar = /^[0-9a-zA-Z_.]+$/.test(username) && isUsrNmNotNumr ? true : false;
			const usernameLng = username.length >= 3 && username.length < 40;
			const usernameOk = validChar && usernameLng ? true : false;

			if (usernameOk) {
				const invalidChangeReq = userData.username == username;

				if (!invalidChangeReq) {
					const usernameExist = await User.findOne({ username });
					if (!usernameExist) {
						const usernameUpdate = await User.updateOne({ _id: userData._id }, { username });

						if (usernameUpdate.nModified == 1) {
							const theUpdatedUsername = username;
							return res.json({ whichPropertyChange, usernameUpdated: "Your username has been changed successfully", theUpdatedUsername });
						}
					} else {
						var usernameMsg = "Username is already exist! Please enter an unique username!";
					}
				} else {
					usernameMsg = "First make change in input box then try!";
				}
			} else {
				if (!usernameOk) {
					if (!usernameF) {
						usernameMsg = "You must have an username!";
					} else if (!usernameLng) {
						usernameMsg = "Username could be 3 to 40 characters long!";
					} else if (!validChar) {
						usernameMsg = "Please enter valid username!";
					}
				}
			}

			return res.json({ whichPropertyChange, usernameMsg });
		} else if (whichPropertyChange == "email") {
			// Check filled or not
			const emlF = email.length > 0;

			// email validation
			const emlLng = email.length < 40;
			const validEmail = emailValidation(email);
			const emailOk = emlF && emlLng && validEmail ? true : false;

			if (emailOk && authPassword) {
				const matched = await bcrypt.compare(authPassword, userData.password);
				if (matched) {
					const invalidChangeReq = userData.email == email;

					if (!invalidChangeReq) {
						const emailExist = await User.findOne({ email });
						if (!emailExist) {
							const emailUpdate = await User.updateOne({ _id: userData._id }, { email, "othersData.emailVerified": false });

							if (emailUpdate.nModified == 1) {
								// Email changed notification to user >> Start
								const sentTo = userData.email;
								let subject = "Account update! | Email address has been changed!";
								const themMailMsg = `<div style="width: 100%; font-size: 15px; line-height: 21px; color: rgb(20, 24, 35); font-family: arial, sans-serif;">
                                                        <div style="margin-top: 16px; margin-bottom: 20px;">Hi ${userData.username},</div>
                                                        <p style="color: rgb(109, 109, 108);">Your email address has been changed ${userData.email} to ${email}!</p>
                                                    </div>`;

								await mailSending(sentTo, subject, themMailMsg);
								// Email changed notification to user >> End

								// email verification code sending
								userData.email = email;
								subject = "Email address changed! | Verify new email address";
								const plainTextMsg = "Someone has added your email address to his account. To confirm new email address, please enter the following verification code:";
								const codeName = "Email_verification_code";
								const mail = (await codeSaveDBandMailSend(userData, subject, plainTextMsg, codeName)) || {};

								if (mail.accepted) {
									const theUpdatedEmail = email;
									return res.json({ whichPropertyChange, emailUpdated: "Your email address has been changed!", theUpdatedEmail });
								}
							}
						} else {
							var emailMsg = "Email is already exist! Please enter another email address!";
						}
					} else {
						emailMsg = "First make change in input box then try!";
					}
				} else {
					var authPassMsg = "Password was wrong!";
				}
			} else {
				if (!emailOk) {
					if (!emlF) {
						emailMsg = "You must have an email address with your account!";
					} else if (!emlLng) {
						emailMsg = "Your email address length is too long!";
					} else if (!validEmail) {
						emailMsg = "Please enter valid  email address!";
					}
				}

				if (!authPassword) {
					authPassMsg = "Please enter your password to confirm!";
				}
			}

			return res.json({ whichPropertyChange, emailMsg, authPassMsg });
		} else {
			return next();
		}
	} catch (err) {
		next(err);
	}
};

exports.securityPassUpdate_ApiController = async (req, res, next) => {
	try {
		const userData = req.userData;

		let { currentPass, newPass, confirmPass } = req.body;

		currentPass = !!currentPass ? String(currentPass) : false;
		newPass = !!newPass ? String(newPass) : false;
		confirmPass = !!confirmPass ? String(confirmPass) : false;

		// Check filled or not
		const currentPassF = currentPass.length > 0;
		const newPassF = newPass.length > 0;
		const cnfrmPassF = confirmPass.length > 0;

		/* Password validation */
		const passLng = newPass ? newPass.length >= 8 && newPass.length <= 32 : false;

		/* Weak password check */
		if (newPass) {
			if (String(Number(newPass)) === "NaN") {
				var passwordEnoughStrong = !worstPasswordCheck(newPass);
			} else {
				var isPasswordOnlyNumber = true;
			}
		}

		/* new pass and confirm pass match validation */
		const newAndConfirmPassMatched = cnfrmPassF ? newPass === confirmPass : false;

		const passwordOk = currentPassF && newPassF && passLng && passwordEnoughStrong && cnfrmPassF && newAndConfirmPassMatched ? true : false;

		if (passwordOk) {
			const matched = await bcrypt.compare(currentPass, userData.password); // authentication

			if (matched) {
				// Old password could not be new password
				const isThisOldPass = await bcrypt.compare(newPass, userData.password);

				if (!isThisOldPass) {
					const encryptedPassword = await bcrypt.hash(newPass, 11);
					const passwordUpdate = await User.updateOne({ _id: userData._id }, { password: encryptedPassword });

					if (passwordUpdate.nModified == 1) {
						const passwordUpdated = "Your password has been changed successfully";

						// Password changed notification to user >> Start
						const sentTo = userData.email;
						const subject = "Account update! | Password has been changed!";
						const themMailMsg = `<div style="width: 100%; font-size: 15px; line-height: 21px; color: rgb(20, 24, 35); font-family: arial, sans-serif;">
                                                <div style="margin-top: 16px; margin-bottom: 20px;">Hi ${userData.username},</div>
                                                <p style="color: rgb(109, 109, 108);">Successfully your account's password has been changed!</p>
                                            </div>`;

						await mailSending(sentTo, subject, themMailMsg);
						// Password changed notification to user >> End

						return res.json({ passwordUpdated });
					}
				} else {
					var newPassMsg = "Your tried to set current password as a new password! Enter a different password!";
				}
			} else {
				var curntPassMsg = "Your entered current password was wrong!";
			}
		} else {
			if (!currentPassF) {
				curntPassMsg = "Enter the current password to confirm that you!";
			}

			if (!newPassF) {
				newPassMsg = "Please enter a new password!";
			} else if (!passLng) {
				newPassMsg = "Password should be 8 to 32 characters long!";
			} else if (!passwordEnoughStrong) {
				if (isPasswordOnlyNumber) {
					newPassMsg = "Include minimum 1 letter in your password!";
				} else {
					newPassMsg = "Password should be more strong!";
				}
			}

			if (!cnfrmPassF) {
				var cnfrmPassMsg = "Must have to enter confirm password!";
			} else if (!newAndConfirmPassMatched && passLng) {
				cnfrmPassMsg = "Confirm password doesn't match!";
			}
		}

		return res.json({ curntPassMsg, newPassMsg, cnfrmPassMsg });
	} catch (err) {
		next(err);
	}
};

exports.logoutFromLoggedDevices_ApiController = async (req, res, next) => {
	try {
		const userData = req.userData;
		let { logId } = req.body;

		const isValidObjId = mongoose.Types.ObjectId.isValid(logId);

		if (isValidObjId) {
			const deleteCookie = await LoginCookie.deleteOne({ $and: [{ userObjId: userData._id }, { _id: logId }] });

			if (deleteCookie.deletedCount) {
				return res.json({ requestSuccess: true });
			}
		} else if (logId === "ALL_LOGOUT") {
			// detect all cookies except current device
			const deleteAllCookie = await LoginCookie.deleteMany({
				$and: [{ userObjId: userData._id }, { $nor: [{ cookieVal: req.cookies.access_l }] }],
			});

			if (deleteAllCookie) {
				return res.json({ requestSuccess: true });
			}
		}
	} catch (err) {
		next(err);
	}
};

exports.socialLinksUpdate_ApiController = async (req, res, next) => {
	try {
		const userData = req.userData;

		let { linkedinInput, facebookInput, instagramInput, twitterInput, githubInput, dribbbleInput } = req.body;

		function usernameValidate(rawUsername, whichUsername, dataUser) {
			// Check filled or not
			const usernameF = rawUsername.length > 0;
			// username validation
			const isUsrNmNotNumr = String(Number(rawUsername)) === "NaN";
			const validChar = /^[0-9a-zA-Z_.]+$/.test(rawUsername) && isUsrNmNotNumr ? true : false;
			const usernameLng = rawUsername.length >= 3 && rawUsername.length < 40;
			const usernameOk = validChar && usernameLng ? true : false;

			if (!usernameOk) {
				if (!usernameLng && usernameF) {
					var issue = "Username could be 3 to 40 characters long!";
				} else if (!validChar && usernameF) {
					issue = `Please enter valid ${whichUsername} username!`;
				}
			}

			let dbUsername = "";
			if (whichUsername == "linkedin") {
				dbUsername = dataUser.othersData.socialLinks.linkedin;
			} else if (whichUsername == "facebook") {
				dbUsername = dataUser.othersData.socialLinks.facebook;
			} else if (whichUsername == "instagram") {
				dbUsername = dataUser.othersData.socialLinks.instagram;
			} else if (whichUsername == "twitter") {
				dbUsername = dataUser.othersData.socialLinks.twitter;
			} else if (whichUsername == "github") {
				dbUsername = dataUser.othersData.socialLinks.github;
			} else if (whichUsername == "dribbble") {
				dbUsername = dataUser.othersData.socialLinks.dribbble;
			}
			const username = usernameF ? (usernameOk ? rawUsername : dbUsername) : "";

			return { username, issue };
		}

		const { username: linkedin, issue: linkedinIssue } = usernameValidate(linkedinInput, "linkedin", userData);
		const { username: facebook, issue: facebookIssue } = usernameValidate(facebookInput, "facebook", userData);
		const { username: instagram, issue: instagramIssue } = usernameValidate(instagramInput, "instagram", userData);
		const { username: twitter, issue: twitterIssue } = usernameValidate(twitterInput, "twitter", userData);
		const { username: github, issue: githubIssue } = usernameValidate(githubInput, "github", userData);
		const { username: dribbble, issue: dribbbleIssue } = usernameValidate(dribbbleInput, "dribbble", userData);

		console.log({ linkedinIssue, facebookIssue, instagramIssue, twitterIssue, githubIssue, dribbbleIssue });

		await User.updateOne(
			{ _id: userData._id },
			{
				"othersData.socialLinks.linkedin": linkedin,
				"othersData.socialLinks.facebook": facebook,
				"othersData.socialLinks.instagram": instagram,
				"othersData.socialLinks.twitter": twitter,
				"othersData.socialLinks.github": github,
				"othersData.socialLinks.dribbble": dribbble,
			}
		);

		return res.json({ linkedinIssue, facebookIssue, instagramIssue, twitterIssue, githubIssue, dribbbleIssue });
	} catch (err) {
		next(err);
	}
};
