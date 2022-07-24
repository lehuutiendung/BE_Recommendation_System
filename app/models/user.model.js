const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    //ID người dùng (int)
    userID: {
      type: Number,
      unique: true,
      required: true,
      default: 1
    },
    //Email
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    //Họ và tên
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    //Họ và tên được lược bỏ dấu => Tìm kiếm
    userNameEng: {
      
      type: String,
      required: true,
      trim: true,
    },
    //Mật khẩu
    password: {
      type: String,
      required: true,
      trim: true,
    },
    //SĐT
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    //Giới tính { 0: Nam, 1: Nữ}
    gender: {
      type: Number,
      default: 0
    },
    //Ngày sinh
    dateOfBirth: {
      type: Date,
    },
    //Ảnh đại diện
    avatar:{
      imageURL:{
        type: String,
        default: "https://res.cloudinary.com/visonetcloud/image/upload/v1640571720/Image%20Default/default-avatar_a46464.jpg"
      },
      cloudinaryID:{
          type: String,
          default: "Image%20Default/default-avatar_a46464"
      },
    },
    //Khung nền trang cá nhân
    background:{
      imageURL:{
        type: String,
        default: "https://res.cloudinary.com/visonetcloud/image/upload/v1640572094/Image%20Default/default-background-user_jr95uh.jpg"
      },
      cloudinaryID:{
          type: String,
          default: "Image%20Default/default-background-user_jr95uh"
      },
    },
    //Quê quán 
    hometown:{
      type: String,
      default: null
    },
    //Dân tộc
    ethnic:{
      type: String,
      default: null
    },
    //Tôn giáo
    religion:{
      type: String,
      default: null
    },
    //Quốc tịch
    nationality:{
      type: String,
      default: null
    },
    //Trích dẫn
    quotes:{
      type: String,
      default: null
    },
    //Danh sách bạn bè
    friends:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    //Danh sách tham gia group
    groups:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group"
    }],
    //Quyền: Admin, User
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    // ID socket khi kết nối được gán với mỗi user
    socketID: {
      type: String,
      default: null
    },
    // Trạng thái online/offline
    isOnline: {
      type: Boolean,
      default: false
    }
  },{
    timestamps: true,
  })
);

module.exports = User;