const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, home, refresh, logout } = require('../controllers/adminControllers');

const bodyParser = require('body-parser');
const { auth } = require('../middlewares/auth');
const { verifyMail } = require('../utils/verifyMail');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));



router.route("/register").post(registerAdmin);
router.route("/login").post(loginAdmin);
router.route("/home").get(auth, home);
router.route("/refresh").post(refresh);
router.route("/logout").post(auth, logout);
router.route("/verify").get(verifyMail);


module.exports = router;