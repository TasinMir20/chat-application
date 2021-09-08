const mongoose = require('mongoose'); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

const VerifyCode = require("../models/VerifyCode");
const Conversation = require("../models/Conversation");
const User = require("../models/User");


const {codeSaveDBandMailSend} = require("../utils/func/func")

exports.mainPathController = async (req, res, next) => {

    try {
        const fullName = req.userData.firstName + ' ' + req.userData.lastName;
        const username = req.userData.username;
        res.render("pages/user-logged-pages/user-main.ejs", {dataPass: {username, fullName}});

    } catch (err) {
        next(err);
    }
}

exports.dashboardController = async (req, res, next) => {

    try {
        
        res.send("Dashboard");
    } catch (err) {
        next(err);
    }
}


exports.emailVerification = async (req, res, next) => {

    try {
        const user = req.userData;
        const emailVerifyCodeData = await VerifyCode.findOne({ $and: [{ userObjId: user._id }, { codeName: "Email_verification_code" }] });

        // If No exist email verification code on Database so saving the verification code to Database and mail sending
        if (!emailVerifyCodeData) {
            const subject = "Email address verification";
            const plainTextMsg = "Enter the following email verify code:";
            const codeName = "Email_verification_code";
            await codeSaveDBandMailSend(user, subject, plainTextMsg, codeName);
        }

        return res.render("pages/user-logged-pages/email-verification.ejs");
    } catch (err) {
        next(err);
    }

    
}

exports.messenger = async (req, res, next) => {


    try {

        const userData = req.userData;

        res.render("pages/user-logged-pages/messenger.ejs", {userData});

    } catch (err) {
        next(err);
    }
}