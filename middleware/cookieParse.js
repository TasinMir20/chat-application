exports.cookieParse = (req, res, next) => {

    let rawCookies = req.headers.cookie;
    let cookiesObj = {};
    rawCookies && rawCookies.split(';').forEach(function( cookie ) {
        const parts = cookie.split('=');
        cookiesObj[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    req.cookies = cookiesObj;

    next();
}

