const nodemailer = require('nodemailer');
const User = require("../models/user.model");
const ForgetPassword = require("../models/forget-password.model");
const { v1: uuidv1, v4: uuidv4 } = require('uuid');
const bcrypt = require("bcryptjs");
require('dotenv').config();

var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'gmail',
    auth: {
      user: process.env.USERMAIL,
      pass: process.env.PASSMAIL
    }
});

module.exports = {
    // Gửi mail quên mật khẩu
    mailForgetPassword: async(req, res, next) => {
        try {
            let email = req.body.email;
            let user = await User.findOne({"email": email});
            if(user === null){
                res.status(200).json({
                    success: false,
                    code: "USER_NOT_EXIST",
                    message: "This user does not exist"
                })
                return;
            }
            let resetPass = await ForgetPassword.find({"email": email});
            let resetCode = uuidv4();
            if(resetPass.length > 0){
                // Nếu đã tồn tại mã thay đổi mật khẩu cũ -> Xóa
                const result = await ForgetPassword.deleteMany({ "email" : email });
            }
            const doc = await ForgetPassword.create({
                email: email,
                resetCode: resetCode
            });

            let host = `http://localhost:8080`;
            const link = host + '/change-password/' + resetCode;
            const mailOption = {
                from: process.env.USERMAIL,
                to: email,
                subject: 'Khôi phục mật khẩu Visonet',
                html: `<div style="background-color: #eeeeee; padding: 20px">
                <div style="width: 100%; height: auto; display: flex; align-items: center; justify-content: center; flex-direction: column">
                    <img src="https://res.cloudinary.com/visonetcloud/image/upload/v1654929937/logo_text_vgetpr.png" width="160" height="56">
                </div>
                <div style="margin-top: 10px">Xin chào bạn,</div>
                <div style="margin-top: 10px">Để khôi phục mật khẩu của bạn trên Visonet, vui lòng truy cập đường dẫn: <a href="` + link + `">Tại đây</a></div>
                <div style="margin-top: 10px">Cảm ơn bạn!</div>
                <div sytle="margin-bottom: 20px">Visonet</div>
                <div style="margin: 20px 0;border:1px solid #d5d5d5"></div>
                <span style="color: #707070">Tin nhắn này được gửi tự động từ hệ thống Visonet, vui lòng không trả lời tin nhắn này!</span>
                </div>`
            }
            transporter.sendMail(mailOption);
            res.status(200).json({
                status: 'Success',
                success: true
            })
        } catch (e) {
            throw e
        }
    },
    //Lấy data quên mật khẩu của người dùng theo email
    getForgetPassword: async(req, res, next) => {
        try {
            const doc = await ForgetPassword.findOne({"resetCode": req.body.resetCode});
            if(doc === null){
                res.status(200).json({
                    status: 'Success',
                    success: false,
                    code: "FORGETPASSWORD_CODE_NOT_EXISTS"
                })
                return;
            }
            const docUser = await User.findOne({"email": doc.email});
            const data = {
                email: doc.email,
                resetCode: doc.resetCode,
                userName: docUser.userName,
                avatar: docUser.avatar
            }
            res.status(200).json({
                status: 'Success',
                success: true,
                data
            })
        } catch (error) {
            next(error);
        }
    },
    //Cập nhật mật khẩu người dùng
    updatePassword: async(req, res, next) => {
        try {
            const doc = await User.findOneAndUpdate({"email": req.body.email}, {
                $set:{
                    password: bcrypt.hashSync(req.body.password, 8)
                }
            })
            const docReset = await ForgetPassword.findOneAndDelete({"resetCode": req.body.resetCode});
            res.status(200).json({
                status: 'Success',
                success: true,
            })   
        } catch (error) {
            next(error);
        }
    }
}
