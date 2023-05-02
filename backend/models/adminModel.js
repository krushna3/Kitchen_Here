const mongoose = require('mongoose')
const validator = require('validator')

const adminSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, "Please Enter Your First Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name Should have more than 4 characters"]
    },
    last_name: {
        type: String,
        required: [true, "Please Enter Your Last Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name Should have more than 4 characters"]
    },
    user_id: {
        type: String,
        required: [true, "Please Enter Your UserId"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"]
    },
    password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password Should have more than 8 characters"],
        select: false,
    },
    role: {
        type: String,
        default: "admin",
    },
    is_verified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Admin", adminSchema);
