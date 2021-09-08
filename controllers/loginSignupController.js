const mongoose = require('mongoose'); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

const VerifyCode = require("../models/VerifyCode");

exports.loginSignupGetController = async (req, res, next) => {

    try {

        // making decision which part should have to show to the user front of the login, sigpnup, forgetPass parts

        const isValidObjId = mongoose.Types.ObjectId.isValid(req.cookies.recovery);

        if (isValidObjId) {
            var codeFind = await VerifyCode.findOne({ $and: [{ _id: req.cookies.recovery }, { codeName: "Password_recovery_code" }] });

            if (!codeFind) {
                res.clearCookie("recovery");
            }

        } else {
            res.clearCookie("recovery");
        }
        

        if (codeFind) {
            return res.render("pages/out-of-auth/login-signup.ejs", {dataPass: { forgetPartShow: true, codePartShow: !(codeFind.used), passPartShow: codeFind.used} });
        } else {
            return res.render("pages/out-of-auth/login-signup.ejs", {dataPass: {} });
        }

    } catch (err) {
        next(err);
    }


}
