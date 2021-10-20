const { Schema, model } = require("mongoose");

const VerifyCodeSchema = new Schema({
	userObjId: String,
	codeName: String,
	theCode: String,
	used: Boolean,
	codeCreateTime: Number,
	expireTime: Number,
	wrongTryTime: Number,
});

const VerifyCode = model("VerifyCode", VerifyCodeSchema);

module.exports = VerifyCode;
