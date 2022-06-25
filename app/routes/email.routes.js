const express = require('express');
const router = express.Router();
const emailController = require("../controllers/email.controller");

//Gửi mail yêu cầu reset mật khẩu
router.post("/forget-password", emailController.mailForgetPassword);

//Check tồn tại yêu cầu reset mật khẩu
router.post("/forget-password-code", emailController.getForgetPassword);

//Cập nhật mật khẩu
router.post("/update-password", emailController.updatePassword);

module.exports = router;