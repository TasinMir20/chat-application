const uploader = require("./uploader");

function messengerFileUpload(req, res, next) {
    const allow_file = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const uniqueFileName = String(`m${req.userData._id}-${Date.now()}`);
    const upload = uploader("messenger/images", allow_file, 10000000, 1, "Only .jpg, jpeg or .png format allowed!", uniqueFileName);
    // call the middleware function
    upload.any()(req, res, (err) => {
        if (err) {
            next(err);
        } else {
            next();
        }
    });
}

module.exports = messengerFileUpload;
