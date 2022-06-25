const User = require("../models/user.model");
const RoomChat = require("../models/room-chat.model");
const PackMessage = require("../models/pack-message.model");
const mongoose = require('mongoose');
const cloudinary = require("../config/cloudinary.config");

module.exports = {
    //Lấy ID của room chat (Khởi tạo room chat nếu chưa tồn tại)
    getIDRoomSingle: async(userIDOne, userIDTwo) => {
        try {
            let doc = await RoomChat.findOne({
                $and: [
                    {
                        members:{
                            $all: [userIDOne, userIDTwo]
                        }
                    }, 
                    {
                        members:{
                            $size: 2                    //Chat đơn -> size = 2
                        }
                    }
                ]
            })
            if(doc === null){
                doc = await RoomChat.create({members: [ userIDOne, userIDTwo ]});
            }
            return doc._id;
        } catch (error) {
            next(error);
        }
    },
    //Gửi tin nhắn (thực hiện bởi socket)
    sendMessage: async(data) => {
        try {
            let fromUserID = data.fromUserID;
            let toUserID = data.toUserID;
            let content = data.content;
            let image = data.image;
            let message = {
                fromUserID: fromUserID,
                content: content,
                image: image
            }
            const docRoom = await module.exports.getIDRoomSingle(fromUserID, toUserID);
            await PackMessage.findOneAndUpdate(
            {
                "roomID": docRoom._id, 
                "packSize": {$lt : 10}
            },
            {
                $push: {
                    messages: message
                },
                $inc: { "packSize" : 1}
            },{
                upsert: true
            })
        } catch (error) {
            throw error;
        }
    },
    pagingMessage: async(req, res, next) => {
        try {
            const docRoom = await module.exports.getIDRoomSingle(req.body.fromUserID, req.body.toUserID);
            let data = await PackMessage.findOne({"roomID": docRoom._id}).sort({"updatedAt": -1}).skip(req.body.pageSize - 1);
            res.status(200).json({
                status: 'success',
                success: true,
                data
            });   
        } catch (error) {
            next(error);
        }
    }

}