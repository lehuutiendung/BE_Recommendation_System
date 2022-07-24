const mongoose = require("mongoose");

const Notification = mongoose.model(
  "Notification",
  new mongoose.Schema({
    // ID người gửi yêu cầu
    userRequestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        trim: true,
    },
    // ID người nhận yêu cầu
    userRecipientID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        trim: true,
    },
    /**
     * Trạng thái yêu cầu ( 1 = requested, 2 = accepted , 3 = rejected, 4 = none )
     * File Enum: enums/request.js
     */
    status: {
        type: Number,
        required: true
    },
    // Trạng thái đã xem thông báo chưa
    seen:{
      type: Boolean,
      default: false
    },
    /**
     * typeNoti: 0: gửi yêu cầu kết bạn | 1: bài viết | 2: tin nhắn
     */
    typeNoti: {
      type: Number,
      default: 0
    },
    /**
     * ID bài viết (nếu là thông báo của bài viết)
     */
    postID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      trim: true,
      default: null
    }
  },{
    timestamps: true,
  })
);

module.exports = Notification;