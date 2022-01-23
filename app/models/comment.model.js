const mongoose = require("mongoose");
const schema = mongoose.Schema;
/**
 * Bình luận
 */
const Comment = mongoose.model(
  "Comment",
  new mongoose.Schema({
    post: {
        type: schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        trim: true,
    },
    owner: {
        type: schema.Types.ObjectId,
        ref: 'User',
        required: true,
        trim: true,
    },
    content: {
        type: String,
        default: null,
        trim: true,
    },
    image:[{
      imageURL:{
        type: String,
        default: null
      },
      cloudinaryID:{
          type: String,
          default: null
      },
    }],
  }, {
    timestamps: true,
  })
);

module.exports = Comment;