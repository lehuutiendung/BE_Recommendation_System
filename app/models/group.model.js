const mongoose = require("mongoose");
const schema = mongoose.Schema;
/**
 * Nhóm
 */
const Group = mongoose.model(
  "Group",
  new mongoose.Schema({
    //Tên nhóm
    name: {
        type: String,
        required: true,
        trim: true
    },
    //Tên nhóm không dấu
    nameGroupEng: {
        type: String,
        required: true,
        trim: true
    },
    //Admin nhóm
    admin: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true,
        trim: true,
    },
    //Thành viên nhóm
    members: [{
        type: schema.Types.ObjectId,
        ref: 'User',
        trim: true,
    }],
    //Thông tin chung của nhóm
    general: {
        type: String,
    },
    //Ảnh nền, background nhóm
    background:{
        imageURL:{
          type: String,
          default: null
        },
        cloudinaryID:{
            type: String,
            default: null
        },
      },
  }, {
    timestamps: true,
  })
);

module.exports = Group;