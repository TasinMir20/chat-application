const bcrypt = require('bcrypt');

const User = require("../../models/User");
const VerifyCode = require("../../models/VerifyCode");


const {worstPasswordCheck, mailSending, doLogin, codeResendTimeInSeconds, codeSaveDBandMailSend} = require("../../utils/func/func")



exports.signupApiController = async (req, res, next) => {

    let { firstName, lastName, regEmail, newPass, confirmPass } = req.body;

    try {

        firstName = !!firstName ? String(firstName).trim() : false;
        lastName = !!lastName ? String(lastName).trim() : false;
        regEmail = !!regEmail ? String(regEmail).toLowerCase().trim() : false;
        newPass = !!newPass ? String(newPass) : false;
        confirmPass = !!confirmPass ? String(confirmPass) : false;

        // Check filled or not
        const fstNmF = firstName.length > 0;
        const lstNmF = lastName.length > 0;
        const emlF = regEmail.length > 0;
        const newPassF = newPass.length > 0;
        const cnfrmPassF = confirmPass.length > 0;


        //////////////////////////////////////// INPUT VALIDATION START ////////////////////////////////////////

        // First name validation
        const letters = /^[A-Za-z]+$/;

        const fnmLng = firstName.length <= 46 && firstName.length >= 3;
        const fNameLettersValid = firstName ? !!(firstName.match(letters)) : false;
        const fNameOk = fstNmF && fnmLng && fNameLettersValid ? true : false;

        // Last name validation
        const lnmLng = lastName.length <= 46 && lastName.length >= 2;
        const lNameLettersValid = lastName ? !!(lastName.match(letters)) : false;
        const lNameOk = lstNmF && lnmLng && lNameLettersValid ? true : false;

        /* username generating */
        if (regEmail) {
            const targetOfSlice = regEmail.indexOf("@");
            var username = regEmail.slice(0, targetOfSlice);
            let usernameExist = await User.findOne({ username });

            if (usernameExist) {

                for (let i = 1; i < 1000;) {
                    // get specific random number
                    const min = 1
                    const max = 999;
                    const rndInt = Math.floor(Math.random() * (max - min + 1) + min);
                    var u = username + rndInt;
                    usernameExist = await User.findOne({ username: u });
                    console.log("Looping at 'signupApiController' to generate username");
                    if (!usernameExist) {
                        i +=1001;
                    }
                }
                username = u;
            }
        }

        /* Email validation */
        if (regEmail) {

            var emlLng = regEmail.length < 40;

            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var validEmail = re.test(regEmail);
            var emailExist = await User.findOne({ email: regEmail });
            var emailOk = emlF && emlLng && validEmail && !emailExist ? true : false;
        }
        
        /* Password validation */
        const passLng = newPass ? (newPass.length >= 8 && newPass.length <= 32) : false;

        /* Weak password check */
        if (newPass) {

            if (String(Number(newPass)) === "NaN") {
                var passwordEnoughStrong = !(worstPasswordCheck(newPass));
    
            } else {
                var isPasswordOnlyNumber = true;
            }
        }

        /* new pass and confirm pass match validation */
        const newAndConfirmPassMatched = cnfrmPassF ? (newPass === confirmPass) : false;

        const passwordOk = newPassF && passLng  && passwordEnoughStrong && cnfrmPassF && newAndConfirmPassMatched ? true : false;

        //////////////////////////////////////// INPUT VALIDATION END ////////////////////////////////////////

        
        if (fNameOk && lNameOk && emailOk && passwordOk) {

            const currentEpochTime = Math.floor(new Date().getTime()/1000);
            const encryptedPassword = await bcrypt.hash(newPass, 11);
            
            const userInsertStructure = new User({
                firstName,
                lastName,
                username,
                email: regEmail,
                password: encryptedPassword,
                othersData: {
                    userCreateTime: currentEpochTime,
                    profilePic: "default_profile_pic.png",
                    lastOnlineTime: 1,
                    emailVerified: false,
                    codeSendTimes: {
                        email_verify_code: 1,
                        recovery_code: 0
                    }
                }

            });

            const saveUserData = await userInsertStructure.save();

            if (saveUserData) {

                // email verification code sending
                const subject = "Email address verification";
                const plainTextMsg = "We're excited to have you get started. First, you need to confirm your email address. Enter the following verification code:";
                const codeName = "Email_verification_code";
                const mail = await codeSaveDBandMailSend(saveUserData, subject, plainTextMsg, codeName) || {};

                if (mail.accepted) {
                    // counting that how many times send email verification code
                    await User.updateOne({ _id: saveUserData._id }, { "othersData.codeSendTimes.email_verify_code": 1 });

                    // Login process
                    const response = res;
                    const nxt = next;
                    const keepLogged = false;
                    const loginSuccess = await doLogin(response, nxt, saveUserData, keepLogged);
                    if (loginSuccess) {
                        return res.json({ account_create: true });
                    }
                } else {
                    throw new Error("Failed to send email verification code");
                }

            } else {
                throw new Error("Failed to save user data to Database");
            }

        } else {

            if (!fNameOk) {

                if (!fstNmF) {
                    var firstNameMsg = "Please enter your first name!";
                } else if (!fnmLng) {
                    firstNameMsg = "First name could be 3 to 46 characters long!";
                } else if (!fNameLettersValid) {
                    firstNameMsg = "Please enter valid name";
                }
            }

            if (!lNameOk) {

                if (!lstNmF) {
                    var lastNameMsg = "Please enter your last name!";
                } else if (!lnmLng) {
                    lastNameMsg = "Last name could be 2 to 46 characters long";
                } else if (!lNameLettersValid) {
                    lastNameMsg = "Please enter valid name";
                }
            }

            if (!emailOk) {

                if (!emlF) {
                    var emailMsg = "Please enter your email address!";
                    
                } else if (!emlLng) {
                    emailMsg = "Your email address length is too long";
                } else if (!validEmail) {
                    emailMsg = "Please enter valid email address!";
                } else if (emailExist) {
                    emailMsg = "Email is already exist! Please enter another email address!";
                }

            }

            if (!passwordOk) {

                if (!newPassF) {
                    var newPassMsg = "Please enter a new password!";
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

                    var cnfrmPassMsg = "Must have to enter confirm password!"
                    
                } else if (!newAndConfirmPassMatched && passLng) {
                    cnfrmPassMsg = "Confirm password doesn't match!";
                }

            }

        }
        
        return res.json({ firstNameMsg, lastNameMsg, emailMsg, newPassMsg, cnfrmPassMsg });

    } catch (err) {
        next(err);
    }

}


exports.loginApiController = async (req, res, next) => {

    let {emailOrUsername, password, keepLogged} = req.body;

    try {

        emailOrUsername = !!emailOrUsername ? String(emailOrUsername).toLowerCase().trim() : false;
        password = !!password ? String(password) : false;

        // Check filled or not
        const emlUserFilled = emailOrUsername.length > 0;
        const passFilled = password.length > 0;

        //////////////////////////////////////// INPUT VALIDATION START ////////////////////////////////////////

        if (emlUserFilled) {

            /* Email validation */
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var emailOk = re.test(emailOrUsername) ? true : false;

            /* username validation */
            const isUsrNmNotNumr = (String(Number(emailOrUsername)) === "NaN");
            var userOk = (/^[0-9a-zA-Z_.]+$/.test(emailOrUsername)) && isUsrNmNotNumr ? true : false;

            var emailOrUserOk = emailOk || userOk;

            // user exist or not
            var userExist = emailOrUserOk ? await User.findOne({ $or: [ { email: emailOrUsername }, { username: emailOrUsername } ] }) : '';
        }

        //////////////////////////////////////// INPUT VALIDATION END ////////////////////////////////////////

        if (userExist && passFilled) {

            const matched = await bcrypt.compare(password, userExist.password);

            if (matched) {
                const response = res;
                const nxt = next;
                const loginSuccess = await doLogin(response, nxt, userExist, keepLogged);

                return res.json({ loginSuccess });

            } else {
                var passMsg = "Password wrong!";
            }

        } else {

            if (!emlUserFilled) {
                var userMsg = "Please enter your email address or username!";
            } else {
                
                if (!emailOrUserOk) {
                    userMsg = "Invalid input!";
                } else if (!userExist) {
                    if (emailOk) {
                        userMsg = "There is no account under the email";
                    } else if (userOk) {
                        userMsg = "There is no account under the username";
                    }
                }
            }

            if (!passFilled) {
                passMsg = "Please enter your password!";
            }
        }
        return res.json({userMsg, passMsg});

    } catch (err) {
        next(err);
    }
}


// Forget Recovery APIs controllers >> Start
exports.forgetPassEmail_ApiController = async (req, res, next) => {

    let { userOrEmail } = req.body;

    try {

        userOrEmail = !!userOrEmail ? String(userOrEmail).toLowerCase().trim() : false;

        // Check filled or not
        const userOrEmailFilled = userOrEmail.length > 0;

        //////////////////////////////////////// INPUT VALIDATION START ////////////////////////////////////////
        if (userOrEmailFilled) {

            /* Email validation */
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var emailOk = re.test(userOrEmail) ? true : false;

            /* username validation */
            const isUsrNmNotNumr = (String(Number(userOrEmail)) === "NaN");
            var userOk = (/^[0-9a-zA-Z_.]+$/.test(userOrEmail)) && isUsrNmNotNumr ? true : false;

            var userOrEmailOk = emailOk || userOk;

            // user exist or not
            var userExist = userOrEmailOk ? await User.findOne({ $or: [ { email: userOrEmail }, { username: userOrEmail } ] }) : '';
        }

        //////////////////////////////////////// INPUT VALIDATION END ////////////////////////////////////////

        if (userExist) {

            // check that already code send four times with 12 hours
            const fourTimes = (userExist.othersData.codeSendTimes.recovery_code >= 4 );
            if (!fourTimes) {

                // before send recovery code, delete old recovery code from database
                await VerifyCode.deleteMany({ $and: [{ userObjId: userExist._id }, { codeName: "Password_recovery_code" }] });


                // saving the recovery code to Database and mail sending
                const mail = await codeSaveDBandMailSend(userExist) || {};

                if (mail.accepted) {
                    const { saveCodeData } = mail;
                    // counting that how many times send recovery code
                    await User.updateOne({ _id: userExist._id }, { "othersData.codeSendTimes.recovery_code": 1 });

                    res.cookie("recovery", String(saveCodeData._id));
                    return res.json({codeSend: true});
                } else {
                    throw new Error("Failed to send recovery code");
                }

            } else {

                const codeFind = await VerifyCode.findOne({ $and: [{ userObjId: userExist._id }, { codeName: "Password_recovery_code" }] });

                if (codeFind) {
                    res.cookie("recovery", String(codeFind._id));
                    return res.json({rld: true});

                } else {

                    // saving the recovery code to Database and mail sending
                    const mail = await codeSaveDBandMailSend(userExist) || {};

                    if (mail.accepted) {
                        const { saveCodeData } = mail;
                        // counting that how many times send recovery code
                        await User.updateOne({ _id: userExist._id }, { "othersData.codeSendTimes.recovery_code": 1 });

                        res.cookie("recovery", String(saveCodeData._id));
                        return res.json({codeSend: true});
                    } else {
                        throw new Error("Failed to send recovery code");
                    }
                }
                
            }

        } else {

            if (!userOrEmailFilled) {
                var forgetUserMsg = "Please enter your email address or username!";
            } else {
                if (!userOrEmailOk) {
                    forgetUserMsg = "Invalid input!";
                } else if (!userExist) {
                    if (emailOk) {
                        forgetUserMsg = "There is no account under the email";
                    } else if (userOk) {
                        forgetUserMsg = "There is no account under the username";
                    }
                }
            }
        }

        return res.json({forgetUserMsg});

    } catch (err) {
        next(err);
    }

}


exports.forgetPassCode_ApiController = async (req, res, next) => {

    let { userEnteredCode } = req.body;

    try {

        userEnteredCode = !!userEnteredCode ? String(userEnteredCode).trim() : false;

        if (userEnteredCode) {
            const recoveryCodeData = req.recovery_code;
            const currentEpochTime = Math.floor(new Date().getTime()/1000);

            if (recoveryCodeData.expireTime > currentEpochTime) {
                if (recoveryCodeData.wrongTryTime <= 4) {

                    if (recoveryCodeData.theCode === userEnteredCode) {
                        await VerifyCode.updateOne({_id: recoveryCodeData._id}, {used: true});
                        var codeMatched = true;
                    } else {
                        await VerifyCode.updateOne({ _id: recoveryCodeData._id }, { wrongTryTime: recoveryCodeData.wrongTryTime + 1 });
                        var codeMsg = "You have entered wrong code!";
                    }

                } else {
                    codeMsg = "You tried a lot time with wrong code! Try again later.";
                }
            } else {
                codeMsg = "The code is expired.";
            }
        } else {
            codeMsg = "Please enter the recovery code that you received recently.";
        }

        res.json({codeMatched, codeMsg});

    } catch (err) {
        next(err);
    }
}


exports.forgetPassResendCode_ApiController = async (req, res, next) => {

    try {
        const recoveryCodeData = req.recovery_code;
        const user = req.userData;
        

        // Resend code limitation
        const currentTime = Math.floor(new Date().getTime()/1000);
        const zeroTime = (user.othersData.codeSendTimes.recovery_code == 0);
        const oneTime = (user.othersData.codeSendTimes.recovery_code == 1 && (recoveryCodeData.codeCreateTime + 60) < currentTime);
        const twoTimes = (user.othersData.codeSendTimes.recovery_code == 2 && (recoveryCodeData.codeCreateTime + 120) < currentTime);
        const threeTimes = (user.othersData.codeSendTimes.recovery_code == 3 && (recoveryCodeData.codeCreateTime + 180) < currentTime);
        const fourTimes = (user.othersData.codeSendTimes.recovery_code >= 4 && (recoveryCodeData.codeCreateTime + 43200) < currentTime);

        const codeResendAvailable = zeroTime || oneTime || twoTimes || threeTimes || fourTimes;
        
        if (codeResendAvailable) {

            // before send new recovery code, delete old recovery code from database
            await VerifyCode.deleteMany({ $and: [{ userObjId: user._id }, { codeName: "Password_recovery_code" }] });

            // saving the recovery code to Database and mail sending
            const plainTextMsg = "Enter the following password reset code:";
            const mail = await codeSaveDBandMailSend(user, "", plainTextMsg) || {};

            if (mail.accepted) {
                const { saveCodeData } = mail;

                if (fourTimes) {
                    // after 12 hours again get 3 time chance to resend recovery code so `User-othersData.codeSendTimes.recovery_code` value have to be 0
                    await User.updateOne({ _id: user._id }, { "othersData.codeSendTimes.recovery_code": 0 });

                } else {
                    // counting that how many times resend recovery code
                    await User.updateOne({ _id: user._id }, { "othersData.codeSendTimes.recovery_code": user.othersData.codeSendTimes.recovery_code + 1 });
                    
                }

                const userData = await User.findOne({ _id: user._id});

                // Verification code resend করতে পারবে কত সময় পরে সেই seconds গুলো front এ পাঠানো
                const seconds = codeResendTimeInSeconds(userData, saveCodeData);

                res.cookie("recovery", String(saveCodeData._id));
                return res.json({codeResend: true, seconds});
            } else {
                throw new Error("Failed to resend recovery code");
            }


        } else {
            // Verification code resend করতে পারবে কত সময় পরে সেই seconds গুলো front এ পাঠানো
            const seconds = codeResendTimeInSeconds(user, recoveryCodeData);

            return res.json({resendTurnsNotAvailable: "yes", seconds});
        }


    } catch (err) {
        next(err);
    }
    
}


exports.forgetPassPassword_ApiController = async (req, res, next) => {

    let { forgetNewPass, forgetConfirmNewPass } = req.body;

    try {

        forgetNewPass = !!forgetNewPass ? String(forgetNewPass) : false;
        forgetConfirmNewPass = !!forgetConfirmNewPass ? String(forgetConfirmNewPass) : false;

        // Check filled or not
        const newPassFilled = forgetNewPass.length > 0;
        const ConfirmPassFilled = forgetConfirmNewPass.length > 0;

        //////////////////////////////////////// INPUT VALIDATION START ////////////////////////////////////////


        /* Password validation */
        const forgetPassLng = forgetNewPass ? (forgetNewPass.length >= 8 && forgetNewPass.length <= 32) : false;

        /* Weak password check */
        if (forgetNewPass) {

            if (String(Number(forgetNewPass)) === "NaN") {
                var passwordEnoughStrong = !(worstPasswordCheck(forgetNewPass));
    
            } else {
                var isPasswordOnlyNumber = true;
            }
        }

        /* new pass and confirm pass match validation */
        const newAndConfirmPassMatched = ConfirmPassFilled ? (forgetNewPass === forgetConfirmNewPass) : false;

        const passwordOk = newPassFilled && forgetPassLng  && passwordEnoughStrong && ConfirmPassFilled && newAndConfirmPassMatched ? true : false;



        //////////////////////////////////////// INPUT VALIDATION END ////////////////////////////////////////

        if (passwordOk) {
            const recoveryCodeData = req.recovery_code;
            const user = req.userData;

            // Old password could not be new password
            const isThisOldPass = await bcrypt.compare(forgetNewPass, user.password);

            if (!isThisOldPass) {

                const encryptedPassword = await bcrypt.hash(forgetNewPass, 11);
                const passwordChange = await User.updateOne({ _id: user._id}, {password: encryptedPassword});
                
                if (passwordChange.nModified == 1) {

                    await User.updateOne({ _id: user._id }, { "othersData.codeSendTimes.recovery_code": 0 });
                    await VerifyCode.deleteOne({_id: recoveryCodeData._id});
                    res.clearCookie('recovery');

                    const keepLogged = false;
                    const response = res;
                    const nxt = next;
                    const loginSuccess = await doLogin(response, nxt, user, keepLogged);

                    if (loginSuccess) {

                        // Password changed notification to user >> Start
                        const sentTo = user.email;
                        const subject = "Account update!";
                        const themMailMsg = `<div style="width: 100%; font-size: 15px; line-height: 21px; color: rgb(20, 24, 35); font-family: arial, sans-serif;">
                                                <div style="margin-top: 16px; margin-bottom: 20px;">Hi ${user.username},</div>
                                                <p style="color: rgb(109, 109, 108);">Successfully your account's password has been changed!</p>
                                            </div>`;

                        await mailSending(sentTo, subject, themMailMsg);
                        // Password changed notification to user >> End

                        return res.json({passUpdate: true});
                    }
                } else {
                    throw new Error("Failed to update password by recovery");
                }

            } else {
                var forgetNewPassMsg = "Old password could not be new password!";
            }
            
        } else {
            
            if (!newPassFilled) {
                forgetNewPassMsg = "Please enter a new password!";
            } else if (!forgetPassLng) {
                forgetNewPassMsg = "Password should be 8 to 32 characters long!";
            } else if (!passwordEnoughStrong) {

                if (isPasswordOnlyNumber) {
                    forgetNewPassMsg = "Include minimum 1 letter in your password!";
                } else {
                    forgetNewPassMsg = "Password should be more strong!";
                }
            }

            if (!ConfirmPassFilled) {

                var forgetcnfrmPassMsg = "Must have to enter confirm password!"
                
            } else if (!newAndConfirmPassMatched && forgetPassLng) {
                forgetcnfrmPassMsg = "Confirm password doesn't match!";
            }
        }

        return res.json({ forgetNewPassMsg, forgetcnfrmPassMsg });

    } catch (err) {
        next(err);
    }

}

// Forget Recovery APIs controllers >> End

