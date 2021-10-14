const uploader = require("../../utils/func/uploader");
const path = require("path");

function profilePhotoUpload(req, res, next) {
    const MaximumFileSize = 1000000;
    const maxNumberOfFiles = 1;

    const allowFileTypes = [
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/tiff", "image/x-icon", "image/webp", "image/svg+xml"
    ];

    const uniqueFileName = String(`avatar${req.userData._id}-${Date.now()}`);

    const upload_path = `${path.resolve('./')}/public/images/users/profile-photo`;

    const upload = uploader(upload_path, allowFileTypes, MaximumFileSize, maxNumberOfFiles, "This format not allowed!", uniqueFileName);
    // call the middleware function
    upload.any()(req, res, (err) => {
        if (err) {
            if (err.message === "This format not allowed!") {
                var issue = "This type/format files are not allowed!";
            } else if (err.message === "File too large") {
                issue = `Maximum ${MaximumFileSize / 1000000}MB files are allowed!`;
            } else if (err.message === "More files were selected than allowed!") {
                issue = `Maximum ${maxNumberOfFiles} file allowed to upload!`;
            }
            return res.status(406).json({issue});
        } else {
            next();
        }
    });
}

module.exports = profilePhotoUpload;
