const mongoose = require("mongoose");

const RoomChat = mongoose.model(
  "RoomChat",
  new mongoose.Schema({
    // email của người gửi yêu cầu
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    //Đặt tên cho group chat
    name: {
        type: String,
        default: null,
        trim: true
    },
    //Ảnh đại diện của group chat
    avatar:{
        imageURL:{
            type: String,
            default: null
        },
        cloudinaryID:{
            type: String,
            default: null
        },
    },
  },{
    timestamps: true,
  })
);

module.exports = RoomChat;