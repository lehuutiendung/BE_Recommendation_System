const db = require('../models/common.model');
const User = db.user;
const emailValidator = require('deep-email-validator');

module.exports = {
    isEmailValid(email){
        var emailRegrex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!email){
            return false;
        }
        var valid = emailRegrex.test(email);
        if(!valid){
            return false;
        }
        return true;
    },

    isEmailOnline(email){
        return emailValidator.validate(email);
    }
}