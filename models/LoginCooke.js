
const {Schema, model} = require("mongoose");

const loginCookieSchema = new Schema({
    userObjId: String,
    cookieName: String,
    cookieVal: String,
    login: Boolean,
    session: Boolean,
    createTime: Number,
    expireTime: Number,
    ip: String,
    userAgent: Object
});

const LoginCooke = model("LoginCooke", loginCookieSchema);

module.exports = LoginCooke;