const express = require('express');
const { createDish, updateDish, deleteDish, getAllDishes, getDish } = require('../controllers/dishesControllers');
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { isAdmin } = require('../middlewares/isAdmin');


router.route("/createdish").post(auth, isAdmin, createDish);
router.route("/updatedish/:id").put(auth, isAdmin, updateDish);
router.route("/deletedish/:id").delete(auth, isAdmin, deleteDish);
router.route("/getalldishes").get(auth, isAdmin, getAllDishes);
router.route("/getdish/:id").get(auth, isAdmin, getDish);


module.exports = router