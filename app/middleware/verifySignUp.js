const db = require("../models/common.model");
const ROLES = db.ROLES;
const User = db.user;
/**
 * Check trùng Email
 */
checkDuplicateEmail = (req, res, next) => {
    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (user) {
        res.status(400).send({ message: "Failed! Email is already in use!", code_msg: 'DUPLICATE_EMAIL' });
        return;
      }
      next();
    });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }
  next();
};

const verifySignUp = {
    checkDuplicateEmail,
    checkRolesExisted
};

module.exports = verifySignUp;