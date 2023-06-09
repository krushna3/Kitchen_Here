const ErrorHandler = require("../utils/ErrorHandler");
const JwtService = require("../utils/JwtService");

exports.auth = (req, res, next) => {

    let authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new ErrorHandler('UnAuthorized'));
    }

    const token = authHeader.split(' ')[1];

    try {

        const { _id, role } = JwtService.verify(token);

        const admin = {
            _id,
            role
        };
        req.admin = admin;

        next();

    } catch (error) {
        return next(new ErrorHandler('UnAuthorized'));
    }

}