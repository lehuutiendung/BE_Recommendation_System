/**
 * Chia message làm các gói => Dễ dàng paging
 * Mỗi pack chứa "packSize" message
 * Mỗi lần paging, lấy về 1 bản ghi (tương đương với 1 page = "packSize" message)
 */
 const mongoose = require("mongoose");

 const PackMessage = mongoose.model(
   "PackMessage",
   new mongoose.Schema({
     // ID phòng chat
     roomID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RoomChat",
        required: true, 
        trim: true
     },
     packSize: {
        type: Number,
        default: 0
     },
     messages:[
        {
            //ID người gửi tin nhắn
            fromUserID: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, trim: true},
            //Tin nhắn text
            content: {type: String, default: null, trim: true},
            //Tin nhắn hình ảnh
            image:[{
                imageURL:{
                    type: String,
                    default: null
                },
                cloudinaryID:{
                    type: String,
                    default: null
                },
            }],
            createdAt: {type: Date, default: Date.now()},
            updatedAt: {type: Date, default: Date.now()}
        }
     ]
   },{
     timestamps: true,
   })
 );
 
 module.exports = PackMessage;