const mongoose = require("mongoose");
/**
 * Cảm xúc
 */
const React = mongoose.model(
  "React",
  new mongoose.Schema({
    reactName:{
        type: String,
        enum: ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY']
    },
    reactNumber:{
        type: Number,
        enum: [1,2,3,4,5,6]
    }
  })
);

module.exports = React;