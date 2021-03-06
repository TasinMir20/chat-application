const uaParser = require("ua-parser-js");

exports.userAgentParse = (req, res, next) => {
	try {
		const userAgent = req.get("User-Agent");
		let parsedUserAgent = uaParser(userAgent);

		const device = JSON.stringify(parsedUserAgent.device) === JSON.stringify({}); // is empty object?
		if (device) {
			parsedUserAgent.device = { vendor: "", model: "", type: "" };
		}

		const cpu = JSON.stringify(parsedUserAgent.cpu) === JSON.stringify({}); // is empty object?
		if (cpu) {
			parsedUserAgent.cpu = { architecture: "" };
		}

		req.userAgent = parsedUserAgent;

		next();
	} catch (err) {
		next(err);
	}
};

exports.cookieParse = (req, res, next) => {
	try {
		let rawCookies = req.headers.cookie;
		let cookiesObj = {};
		rawCookies &&
			rawCookies.split(";").forEach(function (cookie) {
				const parts = cookie.split("=");
				cookiesObj[parts.shift().trim()] = decodeURI(parts.join("="));
			});

		req.cookies = cookiesObj;

		next();
	} catch (err) {
		next(err);
	}
};
