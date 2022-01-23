const socketController = require('./app/controllers/socket.controller')
const User = require('./app/models/user.model')
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
         * Socket: Gửi thông báo
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
                    typeNotification: data.typeNotification,
                }
                io.to(`${receiver.socketID}`).emit('get_notification', dataEmit);
            } catch (error) {
                throw error
            }                                    
        })

        
    })
}