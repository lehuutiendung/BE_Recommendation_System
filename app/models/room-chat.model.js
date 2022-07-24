const mongoose = require("mongoose");

const RoomChat = mongoose.model(
  "RoomChat",
  new mongoose.Schema({
    // Thành viên trong group chat
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