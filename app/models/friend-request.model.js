const mongoose = require("mongoose");

const FriendRequest = mongoose.model(
  "FriendRequest",
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
     * Trạng thái yêu cầu ( 1 = requested, 2 = accepted , 3 = rejected )
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
    }
  },{
    timestamps: true,
  })
);

module.exports = FriendRequest;