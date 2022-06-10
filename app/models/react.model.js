const mongoose = require("mongoose");
const schema = mongoose.Schema;
/**
 * Cảm xúc
 */
const React = mongoose.model(
  "React",
  new mongoose.Schema({
    // Loại cảm xúc: 1-Like, 2-love, 3-haha, 4-wow, 5-sad, 6-angry    
    reactType:{
        type: Number,
        required: true,
        enum: [1,2,3,4,5,6]
    },
    // ID-GUID Bài viết
    post: {
        type: Number,
        ref: 'Post',
        required: true,
        trim: true,
    },
    // ID-GUID người dùng
    owner: {
        type: Number,
        ref: 'User',
        required: true,
        trim: true,
    }
  })
);

module.exports = React;