const { validToken } = require("../services/authentication");

function checkForAuthenticationCookie(token) {
    return (req, res, next) => {
        const cookieValue = req.cookies?.[token];
        if (!cookieValue) {
            return res.redirect("/loginPage")
        }
        try {
            const userpayload = validToken(cookieValue);
            req.user = userpayload;

        } catch (error) {
            req.user = null;
            return res.redirect("/loginPage")
        }
        return next();
    }
}
function restrictTo(roles = []) {
    return function (req, res, next) {
        if (!req.user) return res.redirect("/user/login");

        if (!roles.includes(req.user.role)) return res.end("unAuthorized")

        return next();
    }
}

module.exports = {
    checkForAuthenticationCookie,
    restrictTo
}