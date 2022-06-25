const mongoose = require("mongoose");
const schema = mongoose.Schema;
/**
 * Bài viết
 */
const Post = mongoose.model(
  "Post",
  new mongoose.Schema({
    //ID bài viết (int)
    postID: {
      type: Number,
      unique: true,
      required: true
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
      resourceType:{
          type: String,
          default: null
      }
    }],
    belongToGroup:{
        type: schema.Types.ObjectId,
        ref: 'Group',
        default: null
    },
    react: [{
        userID:{ type: Number, ref: 'User' },
        reactType: { type: Number }
    }],
  }, {
    timestamps: true,
  })
);

module.exports = Post;