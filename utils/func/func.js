const LoginCookie = require("../../models/LoginCooke");
const User = require("../../models/User");
const VerifyCode = require("../../models/VerifyCode");


function worstPasswordCheck(item) {

    const arrayOfWeakPasswords = ["picture1", "password", "password1", "password12", "password123", "password1234", "senha", "qwerty", "qwerty1", "abc123", "abcd1234", "123abc", "Million2", "OOOOOO", "loveme", "love123", "iloveyou", "iloveyou1", "iloveu", "lovely", "fuckyou", "fuckyou1", "aaron431", "qqww1122", "omgpop", "qwertuiop", "qwerty123", "qwer1234", "1q2w3e4r", "1q2w3e4r5t", "1q2w3e", "admin", "qwertyuiop", "welcome", "princess", "123qwe", "qwe123", "dragon", "sunshine", "football", "football1", "baseball", "monkey", "!@#$%^&*", "charlie", "a123456", "a12345", "b123456", "aa123456", "123456a", "1234qwer", "asdfghjkl", "asdfgh", "donald", "ashley", "unknown", "zxcvbnm", "chatbooks", "jacket025", "evite", "pokemon", "Bangbang123", "jobandtalent", "1qaz2wsx", "q1w2e3r4", "default", "aaaaaa", "soccer", "ohmnamah23", "zing", "shadow", "qazwsx", "michael", "michael1", "party", "daniel", "asdasd", "myspace1", "asd123", "a123456789", "123456789a", "12345a", "superman", "tigger", "purple", "samantha", "charlie", "babygirl", "jordan", "jordan23", "anhyeuem", "killer", "basketball", "michelle", "lol123", "nicole", "naruto", "master", "chocolate", "maggie", "computer", "hannah", "jessica", "hunter", "justin", "cookie", "hello", "hello1", "hello12", "hello123", "help1", "help12", "help123", "help1234", "help12345", "blink182", "andrew", "love", "bailey", "princess1", "a801016", "anthony", "yugioh", "amanda", "asdf1234", "trustno", "trustno1", "butterfly", "x4ivygA51F", "batman", "starwars", "summer", "jakcgt333", "buster", "jennifer", "babygirl", "babygirls", "babygirl1", "family", "azerty", "andrea", "matthew", "pepper", "letmein", "joshua", "123456b", "madison", "Sample123", "jesus1", "taylor", "whatever", "ginger", "flower", "flowers", "robert", "samsung", "gabriel", "alexander", "cheese", "passw0rd", "peanut", "thomas", "angel", "angel1"];

    for (let i = 0; i < arrayOfWeakPasswords.length; i++) {
        if ((arrayOfWeakPasswords[i].toLowerCase()) == (item.toLowerCase())) {
            return true;
        }
    }
    return false;
}


function generate_cookie_token(length){

    const a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    const b = [];  
    for (let i = 0; i<length; i++) {
        let j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

async function mailSending(sentTo, subject, htmlMsg) {

    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
            // host: 'smtp.gmail.com',
            // port: 587,
            service: 'hotmail',
            auth: {
                user: process.env.mail_sending_account,
                pass: process.env.mail_password
            }
    })

    const mailOptions = {
        from: `Support <${process.env.mail_send_from}>`,
        to: sentTo,
        subject,
        html: htmlMsg
    };
    const mailSend = await transporter.sendMail(mailOptions);

    return mailSend;
}

// login process
async function doLogin(req, res, next, userData, keepLogged) {

    try {

        const currentEpochTime = Math.floor(new Date().getTime()/1000);
        const cookieName = "access_l";
        const loginToken = generate_cookie_token(32);

        // how long age of the cookie in seconds
        if (keepLogged) {
            var timeLength = 60*60*24*15;
            var howLongAge = currentEpochTime + timeLength; // 15 days cookie
        } else {
            timeLength = 43200
            howLongAge = currentEpochTime + timeLength; // 12 hours session
        }

        const loginCookieInsertStructure = new LoginCookie({
            userObjId: userData._id,
            cookieName,
            cookieVal: loginToken,
            login: true,
            session: !keepLogged,
            createTime: currentEpochTime,
            expireTime: howLongAge,
            ip: req.ip,
            userAgent: req.userAgent
        });

        const saveLoginCookieData = await loginCookieInsertStructure.save();


        if (saveLoginCookieData) {

            if (keepLogged) {
                // "timeLength" variable multiply with 1000 to convert seconds to milliseconds
                res.cookie(cookieName, loginToken,  { maxAge: timeLength * 1000, httpOnly: true }); // 15 days cookie

            } else {
                res.cookie(cookieName, loginToken); // session
                
            }
            
            return true;

        } else {
            throw new Error('Failed to save Login cookie to Database when Login');
        }

    } catch (err) {
        next(err)
    }
}


function codeResendTimeInSeconds(userData, codeData) {

    const currentTime = Math.floor(new Date().getTime()/1000);
    // Verification code resend করতে পারবে কত সময় পরে সেই seconds গুলো front এ পাঠানো

    if (codeData.codeName === "Password_recovery_code") {

        if (userData.othersData.codeSendTimes.recovery_code == 1) {
            var seconds = (codeData.codeCreateTime + 60) - currentTime
        }
        if (userData.othersData.codeSendTimes.recovery_code == 2) {
            seconds = (codeData.codeCreateTime + 120) - currentTime
        }
        if (userData.othersData.codeSendTimes.recovery_code == 3) {
            seconds = (codeData.codeCreateTime + 300) - currentTime
        }
        if (userData.othersData.codeSendTimes.recovery_code >= 4) {
            seconds = (codeData.codeCreateTime + 43200) - currentTime;
        }
    
        
    } else {
        if (userData.othersData.codeSendTimes.email_verify_code == 1) {
            var seconds = (codeData.codeCreateTime + 60) - currentTime
        }
        if (userData.othersData.codeSendTimes.email_verify_code == 2) {
            seconds = (codeData.codeCreateTime + 120) - currentTime
        }
        if (userData.othersData.codeSendTimes.email_verify_code == 3) {
            seconds = (codeData.codeCreateTime + 300) - currentTime
        }
        if (userData.othersData.codeSendTimes.email_verify_code >= 4) {
            seconds = (codeData.codeCreateTime + 43200) - currentTime;
        }
    }


    return seconds;
}



async function codeSaveDBandMailSend(userData, subject, plainTextMsg, codeName) {

    codeName = codeName || "Password_recovery_code";
    plainTextMsg = plainTextMsg || "We received a request to reset your account password. Enter the following password reset code:";

    try {

        // saving the recovery code to Database
        const theCode = Math.floor(100000 + Math.random() * 900000);
        const currentEpochTime = Math.floor(new Date().getTime()/1000);
        const codeExpireTime = currentEpochTime + 900; // 15 minutes

        const VerifyCodeInsertStructure = new VerifyCode({
            userObjId: userData._id,
            codeName,
            theCode,
            used: false,
            codeCreateTime: currentEpochTime,
            expireTime: codeExpireTime,
            wrongTryTime: 0
        });

        const saveCode = await VerifyCodeInsertStructure.save();

        if (saveCode) {

            // code sending Body
            const sentTo = userData.email;
            subject = subject || "Password recovery code";
            themMailMsg = `<div style="width: 100%; font-size: 15px; line-height: 21px; color: rgb(20, 24, 35); font-family: arial, sans-serif;">
                                <div style="margin-top: 16px; margin-bottom: 20px;">Hi ${userData.username},</div>
                                <p style="color: rgb(109, 109, 108);">${plainTextMsg}</p>
                                <span style="color: rgb(20, 24, 35); background: rgb(231, 243, 255); display: inline-block; padding: 14px 32px; border: 1px solid rgb(24, 119, 242); border-radius: 7px; font-size: 17px; font-family: Roboto; font-weight: 700;">${theCode}</span>
                            </div>`;


            let mail = {};
            // mail = await mailSending(sentTo, subject, themMailMsg);
            mail.saveCodeData = saveCode;
            mail.accepted = true;

            return mail;

        } else {
            throw new Error("Failed to save code to database");
        }
    } catch (err) {
        console.log(err);
    }

}




// authentication processing
async function auth(req, res) {

    try {
        
        const loginCookie = req.cookies.access_l;
        const access = {};
        if (loginCookie) {
            const loginCookieFind = await LoginCookie.findOne({ cookieVal: loginCookie });
            if (loginCookieFind) {
                const currentEpochTime = Math.floor(new Date().getTime()/1000);
                const cookieExpired = loginCookieFind.expireTime < currentEpochTime;

                if (cookieExpired) {
                    await LoginCookie.deleteOne({cookieVal: loginCookie});
                    res.clearCookie('access_l');
                } else {
                    const userData = await User.findOne({ _id: loginCookieFind.userObjId });
                    if (userData) {
                        if (loginCookieFind.login) {
                            req.userData = userData;
                            access.accessible = true;
                            if (userData.othersData.emailVerified) {
                                access.emailVerified = true;
                            } else {
                                access.emailVerified = false;
                            }
                        } else {
                            access.accessible = false;
                        }
                    } else {
                        await LoginCookie.deleteMany({userObjId: loginCookieFind.userObjId});
                        res.clearCookie('access_l');
                    }
                }
                
            } else {
                res.clearCookie('access_l');
            }
        }
        return access;

    } catch(err) {
        console.log(err);
    }
}










module.exports = { worstPasswordCheck, generate_cookie_token, mailSending, doLogin, codeResendTimeInSeconds, codeSaveDBandMailSend, auth }