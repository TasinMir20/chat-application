const uploader = require("./uploader");

function messengerFileUpload(req, res, next) {
    const allow_file = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/tiff", "image/x-icon", "image/webp", "image/svg+xml", "application/pdf", "application/postscript", "application/x-zip-compressed", "application/zip", "application/octet-stream", "audio/mpeg", "audio/wav", "audio/ogg", "text/plain",];
    const uniqueFileName = String(`m${req.userData._id}-${Date.now()}`);
    const upload = uploader("messenger/files", allow_file, 10000000, 1, "This type/format files are not allowed!", uniqueFileName);
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
