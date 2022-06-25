const mongoose = require("mongoose");

const ForgetPassword = mongoose.model(
  "ForgetPassword",
  new mongoose.Schema({
    // email của người gửi yêu cầu
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
      },
    // ID người nhận yêu cầu
    resetCode: {
        type: String,
        required: true,
        trim: true,
    },
  },{
    timestamps: true,
  })
);

module.exports = ForgetPassword;