const Admin = require("../models/adminModel");
const RefreshToken = require("../models/refreshTokenModel")
const sendMail = require("../utils/sendMail");
const securePassword = require("../utils/securePassword");
const JwtService = require("../utils/JwtService");
const bcrypt = require("bcrypt");
const ErrorHandler = require("../utils/Errorhandler");


// Register Admin
exports.registerAdmin = async (req, res, next) => {

    // Check Email Is Exist Or Not
    try {
        const { email } = req.body
        const adminEmail = await Admin.exists({ email });
        if (adminEmail) {
            return next(new ErrorHandler("Email already exist, Please enter a new email", 409));
        }
    } catch (error) {
        return next(error);
    }

    // Getting All The Datas From Clint And Store It On Admin
    const { first_name, last_name, email, user_id, password } = req.body
    const spassword = await securePassword(password);
    const admin = await Admin.create({
        first_name,
        last_name,
        email,
        user_id,
        password: spassword
    })

    // Saving The Admin, Ckecking The AdminData And Send The Verification Mail
    try {
        let adminData = await admin.save();

        if (!adminData) {
            return next(new ErrorHandler("Your registration has been failed", 404));
        }

        const message = ` Hii ${first_name}, please click here http://localhost:8000/api/v1/verify?id=${adminData._id} to Verify Your mail.`;
        await sendMail({
            email: admin.email,
            subject: `Verify Your Mail`,
            message
        });
    } catch (error) {
        return next(error);
    }

    res.status(200).json({
        success: true,
        message: "Your registration has been successfully,please verify your mail"
    });
}


// Admin Login
exports.loginAdmin = async (req, res, next) => {

    const { email, password } = req.body;

    // checking if user is given password and email both
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password", 400));
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const isPasswordMatched = await bcrypt.compare(password, admin.password)

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    if (admin.is_verified === false) {
        return next(new ErrorHandler("Email Is Not Verified Please Verify Email", 420));
    }

    const access_token = JwtService.sign({ _id: admin._id, role: admin.role });
    const refresh_token = JwtService.sign({ _id: admin._id, role: admin.role }, '1y', process.env.REFRESH_TOKEN);

    // Database Whitelisting
    const refreshToken = await RefreshToken.create({ token: refresh_token });
    await refreshToken.save();
    // Cookies
    res.cookie("JWToken", { access_token, refresh_token }, {
        expires: new Date(Date.now() + 3600000),
        httpOnly: true,
    })

    res.status(200).json({
        success: true,
        message: "Log in Successful..!",
        access_token,
        refresh_token
    });
}

// Home
exports.home = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({ _id: req.admin._id }).select("-password -__v -_id -is_verified")
        if (!admin) {
            return next(new ErrorHandler("Not Found", 404));
        }
        res.json(admin);
    } catch (error) {
        return next(error);
    }
}


// Refresh Token Controller
exports.refresh = async (req, res, next) => {
    let refreshToken;
    try {
        refreshToken = await RefreshToken.findOne({ token: req.body.refresh_token });
        if (!refreshToken) {
            return next(new ErrorHandler('Invalid Refresh Token', 401));
        }

        let adminId
        try {

            const { _id } = JwtService.verify(refreshToken.token, process.env.REFRESH_TOKEN)

            adminId = _id
        } catch (error) {
            return next(new ErrorHandler('Invalid Refresh Token', 401));
        }

        const admin = await Admin.findOne({ _id: adminId })
        if (!admin) {
            return next(new ErrorHandler('No Admin Found', 401));
        }

        const access_token = JwtService.sign({ _id: admin._id, role: admin.role });
        const refresh_token = JwtService.sign({ _id: admin._id, role: admin.role }, '1y', process.env.REFRESH_TOKEN);

        // Database Whitelisting
        await RefreshToken.create({ token: refresh_token });
        res.status(200).json({
            access_token,
            refresh_token
        });

    } catch (error) {
        return next(error);
    }

}

// Logout Controller
exports.logout = async (req, res, next) => {
    let refresh_token, access_token;
    try {
        await RefreshToken.deleteOne({ token: req.body.refresh_token });
        refresh_token = req.body.refresh_token;
        access_token = req.headers.authorization;

    } catch (error) {
        return next(new Error('Something Went Worng In The Database'))
    }

    res.clearCookie("JWToken");
    res.status(200).json({
        message: "Logout Successful..!"
    });
}