// First Name, LastName, Username, Email, Password

const {Schema, model} = require("mongoose");


const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        maxlength: 46,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 46,
        required: true
    },
    username: {
        type: String,
        trim: true,
        maxlength: 45,
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    othersData: {
        userCreateTime: Number,
        profilePic: String,
        lastOnlineTime: Number,
        emailVerified: Boolean,
        codeSendTimes: {
            email_verify_code: Number,
            recovery_code: Number,
        }
    }

});

const User = model("User", userSchema);

module.exports = User;