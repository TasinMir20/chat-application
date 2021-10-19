/****** START -- Error handling-----> *******/

/**  if users visit random pages which pages are not available then this page Page will render to user front **/
exports.error404Controller = (req, res, next) => {
	const err = new Error("404 page not found");
	err.status = 404;
	next(err);
};

/**  if any err on server then this page Page will render to user front **/
exports.error500Controller = (err, req, res, next) => {
	if (req.method === "GET") {
		if (err.status === 404) {
			return res.status(404).render("pages/error/404not-found-error.ejs");
		}
		console.log(err);
		return res.status(500).render("pages/error/500server-error.ejs");
	} else {
		if (err.status === 404) {
			return res.status(404).json({ error: "not found" });
		}
		console.log(err);
		return res.status(500).json({ error: "server error" });
	}
};
/****** END -- Error handling-----> *******/
