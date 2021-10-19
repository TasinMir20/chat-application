const mongoose = require("mongoose"); // in this file mongoose required only for this method-> mongoose.Types.ObjectId.isValid

const User = require("../models/User");
const VerifyCode = require("../models/VerifyCode");

exports.recoveryCodeFind = async (req, res, next) => {
	try {
		const isValidObjId = mongoose.Types.ObjectId.isValid(req.cookies.recovery);

		if (isValidObjId) {
			const codeFind = await VerifyCode.findOne({ $and: [{ _id: req.cookies.recovery }, { codeName: "Password_recovery_code" }] });

			if (codeFind) {
				const findUser = await User.findOne({ _id: codeFind.userObjId });

				if (findUser) {
					req.userData = findUser;
					req.recovery_code = codeFind;

					next();
				} else {
					await VerifyCode.deleteMany({ userObjId: codeFind.userObjId });
					res.clearCookie("recovery");
					return res.json({ rld: true });
				}
			} else {
				res.clearCookie("recovery");
				return res.json({ rld: true });
			}
		} else {
			res.clearCookie("recovery");
			return res.json({ rld: true });
		}
	} catch (err) {
		next(err);
	}
};
