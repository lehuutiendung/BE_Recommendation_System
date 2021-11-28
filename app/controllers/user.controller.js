const User = require("../models/user.model");
const Base = require("./base.controller");

module.exports = {
    allAccess: (req, res) => {
        res.status(200).send("Public Content.");
    },

    userBoard: (req, res) => {
        res.status(200).send("User Content.");
    },

    adminBoard: (req, res) => {
        res.status(200).send("Admin Content.");
    },

    moderatorBoard: (req, res) => {
        res.status(200).send("Moderator Content.");
    },
    
    getUser: Base.getOne(User),
}