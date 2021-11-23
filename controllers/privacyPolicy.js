exports.privacyPolicy = (req, res, next) => {
	try {
		return res.render("pages/out-of-auth/privacy-policy.ejs");
	} catch (err) {
		next(err);
	}
};
