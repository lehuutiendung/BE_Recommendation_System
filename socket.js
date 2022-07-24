const socketController = require('./app/controllers/socket.controller')
const chatController = require('./app/controllers/chat.controller')
const User = require('./app/models/user.model')
const Notification = require("./app/models/notification.model");

module.exports = io => {
    io.on("connection", async socket => {
        console.log('socket connect BE: ', socket.id);

        /**
         * User disconnect
         */
        socket.on('disconnect', async () =>{
            try {
                const userNameDisconnect = await socketController.userDisconnect(socket.userID);
                console.log(userNameDisconnect + ' offline');
            } catch (error) {
                throw error
            }
        })

        /**
         * Socket: User online
         */
        socket.on('user-online', async (userID) =>{
            try {
                socket.userID = userID;
                const userNameOnline = await socketController.userConnected(userID, socket.id);
                console.log(userNameOnline + ' online');
            } catch (error) {
                throw error
            }
        })

        /**
         * Socket: Gửi thông báo lời mời kết bạn
         */
        socket.on('send_notification', async (data) => {
            try {
                let receiver = await User.findById(data.userRecipientID);
                let sender = await User.findById(data.userRequestID);
                let dataEmit = {
                    id: data.id,
                    userRequestID: data.userRequestID,
                    userName: sender.userName,
                    avatar: sender.avatar.cloudinaryID,
                    userRecipientID: data.userRecipientID,
                    typeNoti: data.typeNoti,
                    seen: false
                }
                io.to(`${receiver.socketID}`).emit('get_notification', dataEmit);
            } catch (error) {
                throw error
            }                                    
        })

        /**
         * Socket: gửi thông báo bình luận bài viết
         */
        socket.on('notification', async(data) => {
            try {
                let receiver = await User.findById(data.userRecipientID);
                io.to(`${receiver.socketID}`).emit('notification', data);
            } catch (error) {
                throw error
            }
        })
        
        /**
         * Socket gửi tin nhắn
         */
        socket.on('send-message', async(data) => {
            try {
                await chatController.sendMessage(data);
                let userSend = await User.findById(data.fromUserID);
                let userReceive = await User.findById(data.toUserID);
                io.to(`${userSend.socketID}`).emit('receive-message', data);
                io.to(`${userReceive.socketID}`).emit('receive-message', data);
            } catch (error) {
                throw error;
            }
        })

        /**
         * Socket đang viết tin nhắn
         */
        socket.on('typing', async(data) => {
            try {
                io.emit('typing', data);
            } catch (error) {
                throw error;
            }
        })

        /**
         * Socket ngừng viết tin nhắn
         */
        socket.on('stopTyping', async(data) => {
            try {
                io.emit('typing', data);
            } catch (error) {
                throw error;
            }
        })
        
    })
}