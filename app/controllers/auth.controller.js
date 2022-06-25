const config = require("../config/auth.config");
const db = require("../models/common.model");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var validateService = require("../utils/validate");
var convertLanguage = require("../utils/language.convert");
/**
 * Controller Đăng ký
 * @param {*} req 
 * @param {*} res 
 * @created 11/11/2021
 */
exports.signUp = async (req, res) => {
  const userNameEng = convertLanguage.nonAccentVietnamese(req.body.userName);
  var userID = 1;
  var docMaxUserID = await User.findOne().sort({userID:-1}).limit(1);
  if(docMaxUserID){
    userID = docMaxUserID.userID + 1;
  }
  const user = new User({
    userID: userID,
    userName: req.body.userName,
    userNameEng: userNameEng,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    phoneNumber: req.body.phoneNumber
  });
  
  // Kiểm tra địa chỉ email có tồn tại (có thể gửi mail)
  const valid = validateService.isEmailOnline(user.email);
  if(!valid){
    res.status(400).send({ message: 'Please provide a valid email address.', code_msg: 'INVALID_EMAIL'});
    return;
  } 
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      // Mặc định không có role, tài khoản sẽ được cấp quyền mặc định là "user"
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

/**
 * Controller Đăng nhập
 * @param {*} req 
 * @param {*} res 
 * @created 11/11/2021
 */
exports.signIn = (req, res) => {
  User.findOne({email: req.body.email})
      .populate("roles", "-__v")
      .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      var token = jwt.sign({ id: user._id }, config.secret, {
        // expiresIn: 86400 // 24 hours
        expiresIn: '365d'
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        userID: user.userID,
        userName: user.userName,
        userNameEng: user.userNameEng,
        avatar: user.avatar,
        background: user.background,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};