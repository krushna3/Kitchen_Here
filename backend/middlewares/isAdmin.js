const Admin = require("../models/adminModel");
const ErrorHandler = require("../utils/ErrorHandler");

exports.isAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ _id: req.admin._id });
        if (admin.role === 'admin') {
            next();
        }
        else {
            return next(new ErrorHandler('unAuthorized'));
        }
    } catch (err) {
        return next(new ErrorHandler('Internal Server Error', 500));
    }

}