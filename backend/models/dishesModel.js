const mongoose = require('mongoose');


const dishSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please Enter Dish Name"]
    },
    price: {
        type: Number,
        required: [true, "Please Enter Product Price"],
        maxLength: [8, "Price cannot exceed 8 Number"]
    },
    image: {
        type: String,
        required: false,
        get: (image) => {
            return `${process.env.APP_URL}/${image}`
        }
    },
    status: {
        type: String,
        default: "APPROVED"
    },
    action: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, toJSON: { getters: true }, id: false });

module.exports = mongoose.model("Dish", dishSchema)