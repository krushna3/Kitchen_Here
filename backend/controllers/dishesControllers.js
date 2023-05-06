const Dish = require("../models/dishesModel");
const ErrorHandler = require("../utils/ErrorHandler");
const multer = require("multer");
const path = require('path');
const fs = require("fs");

// Setup Multer For MultiPartFormData
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),

    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`

        cb(null, uniqueName)
    }
});


const handleMultiPartData = multer({ storage, limits: { fileSize: 1000000 * 5 } }).single('image');

// Create Dishes 
exports.createDish = async (req, res, next) => {

    handleMultiPartData(req, res, async (err) => {
        if (err) {
            return next(new ErrorHandler(err.message, 500));
        }

        // if User Not Provided The Image 
        if (!(req.file)) {
            res.status(500).json({
                success: false,
                message: "Please Provide The Dish Image !"
            });
            return 0;
        }

        const filePath = req.file.path;
        let dish, dishData;
        const { name, price } = req.body;
        try {
            dish = await Dish.create({
                name,
                price,
                image: filePath
            });
            dishData = await dish.save();
        } catch (err) {
            fs.unlink(path.join(__dirname, `../../backend/uploads/${req.file.filename}`), (err) => {
                if (err) {
                    return next(new ErrorHandler("Internal Server Error", 500));
                }
            });

            return next(err);
        }

        if (!dishData) {
            return next(new ErrorHandler('Failed To Add Dish...', 404))
        }

        res.status(200).json({
            success: true,
            message: "Dish Created Successfully...",
            dishData
        });

    });
}

// Update Dish
exports.updateDish = (req, res, next) => {

    handleMultiPartData(req, res, async (err) => {
        if (err) {
            return next(new ErrorHandler(err.message, 500));
        }

        // if admin provided the image (Here Image is optional)
        let filePath;
        if (req.file) {
            filePath = req.file.path;
        }
        let dish, dishData;
        const { name, price } = req.body;
        try {
            dish = await Dish.findByIdAndUpdate({ _id: req.params.id }, {
                name,
                price,
                ...(req.file && { image: filePath })
            }, { new: true });
            dishData = await dish.save();
        } catch (err) {
            return next(err);
        }

        if (!dishData) {
            return next(new ErrorHandler('Failed To Update Dish...', 404))
        }

        res.status(200).json({
            success: true,
            message: "Dish Updated Successfully...",
            dishData
        });

    });

}

// Delete Dishes

exports.deleteDish = async (req, res, next) => {

    const dish = await Dish.findByIdAndRemove({ _id: req.params.id });

    if (!dish) {
        return next(new Error('Nothing To Delete'));
    }

    const imagePath = dish._doc.image;
    fs.unlink(path.join(__dirname, `../../backend/${imagePath}`), (err) => {
        if (err) {
            return next(new ErrorHandler("Internal Server Error", 500));
        }
    });

    res.status(200).json({
        success: true,
        message: "Dish Deleted Successful",
        dish
    });
}

// Get All Dishes
exports.getAllDishes = async (req, res, next) => {

    let dishes;
    try {
        // mongoose Pagination
        const options = {
            page: Number(req.query.page) || 1,
            limit: 5
        }
        dishes = await Dish.paginate({}, options);
        // Finding all the Dishes
        // dishes = await Dish.find().select('-updatedAt -__v').sort({ _id: -1 });
    } catch (err) {
        return next(err);
    }
    res.status(200).json({
        dishes
    });

}

// Get Dish 
exports.getDish = async (req, res, next) => {
    let dish;
    try {
        dish = await Dish.findOne({ _id: req.params.id }).select('-updatedAt -__v');
    } catch (err) {
        return next(err);
    }
    res.status(200).json({
        dish
    });
}