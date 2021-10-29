const uploader = require("../../utils/func/uploader");
const path = require("path");

function messengerFileUpload(req, res, next) {
	try {
		const MaximumFileSize = 50000000;
		const maxNumberOfFiles = 1;

		const allowFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/tiff", "image/x-icon", "image/webp", "image/svg+xml", "audio/mpeg", "audio/wav", "audio/ogg", "audio/x-m4a", "video/mp4", "video/x-matroska", "video/quicktime", "video/webm", "video/3gpp", "video/vnd.dlna.mpeg-tts", "video/avi", "video/x-ms-wmv", "application/pdf", "application/postscript", "application/x-zip-compressed", "application/zip", "application/octet-stream", "text/plain"];

		const uniqueFileName = String(`m${req.userData._id}-${Date.now()}`);

		const upload_path = `${path.resolve("./")}/private/messenger/files`;

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
				res.status(406).json({ issue });
			} else {
				next();
			}
		});
	} catch (err) {
		next(err);
	}
}

module.exports = messengerFileUpload;
