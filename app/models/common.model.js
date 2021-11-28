const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");

/**
 * ENUM
 */
//Phân quyền: Người dùng, Admin, Người điều hành hệ thống
db.ROLES = ["user", "admin", "moderator"];

module.exports = db;