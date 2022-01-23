const Base = require("./base.controller");
const User = require("../models/user.model");
module.exports = {
    /**
     * Người dùng online
     * @param {*} userID: ID của người dùng
     * @param {*} socketID: Socket được gán với người dùng khi online
     */
    userConnected: async (userID, socketID) => {
        try {
            const doc = await User.findByIdAndUpdate(userID, {
                $set: {
                    socketID: socketID,
                    isOnline: true
                }
            })
            const userNameOnline = doc.userName;
            return userNameOnline
        } catch (error) {
            throw error;
        }
    },

    /**
     * Người dùng offline
     * @param {*} userID: ID socket người dùng offline
     */
    userDisconnect: async (userID) => {
        try {
            const doc = await User.findByIdAndUpdate(userID, {
                $set: {
                    socketID: "",
                    isOnline: false
                }
            })
            const userNameDisconnect = doc.userName;
            return userNameDisconnect
        } catch (error) {
            throw error;
        }
    },

}