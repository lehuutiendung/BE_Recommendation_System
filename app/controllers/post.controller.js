const Post = require("../models/post.model");
const Base = require("./base.controller");
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");

module.exports = {
    // Tạo bài viết: Trong router ( upload file)
    // Cập nhật bài viết: Trong router
    deletePostByID: Base.deleteOne(Post),
    getPostAll: Base.getAll(Post),
    getPostByID: Base.getOne(Post),
}