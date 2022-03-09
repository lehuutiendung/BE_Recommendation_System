const Post = require("../models/post.model");
const User = require("../models/user.model");
const Base = require("./base.controller");
const mongoose = require('mongoose');

module.exports = {
    // Tạo bài viết: Trong router ( upload file)
    // Cập nhật bài viết: Trong router
    deletePostByID: Base.deleteOne(Post),
    getPostAll: Base.getAll(Post),
    getPostByID: Base.getOne(Post),

    getPostPagingInGroup: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const groupID = req.body.groupID;
            const doc = await Post.find({belongToGroup: mongoose.Types.ObjectId(groupID)})
                                    .sort({updatedAt: -1})
                                    .skip(pageSize*req.body.pageIndex - pageSize)
                                    .limit(pageSize);
            const totalRecord = await Post.count();
            const totalPage = Math.ceil(totalRecord / pageSize);
            res.status(200).json({
                status: 'success',
                data:{
                    doc,
                    totalPage: totalPage
                }
            });                        
        } catch (error) {
            next(error);
        }
    },
    getPostInNewsFeed: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const groupID = req.body.groupID;
            let user = await User.findById(req.body.userID);
            const doc = await Post.find({
                                    $or: [{
                                            owner: { $in: [...user.friends, req.body.userID] },
                                        }, {
                                            belongToGroup: { $in: user.groups }
                                        }]
                                    })
                                    .populate('belongToGroup', 'name') 
                                    .sort({updatedAt: -1})
                                    .skip(pageSize*req.body.pageIndex - pageSize)
                                    .limit(pageSize);
            const totalRecord = await Post.count();
            const totalPage = Math.ceil(totalRecord / pageSize);
            res.status(200).json({
                status: 'success',
                data:{
                    doc,
                    totalPage: totalPage
                }
            });                        
        } catch (error) {
            next(error);
        }
    },
    /**
     * Paging bài viết trên trang cá nhân
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getPostInWall: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const doc = await Post.find({
                                    owner: req.body.userID,
                                    })
                                    .populate('belongToGroup', 'name')
                                    .sort({updatedAt: -1})
                                    .skip(pageSize*req.body.pageIndex - pageSize)
                                    .limit(pageSize);
            const totalRecord = await Post.count();
            const totalPage = Math.ceil(totalRecord / pageSize);
            res.status(200).json({
                status: 'success',
                data:{
                    doc,
                    totalPage: totalPage
                }
            });                        
        } catch (error) {
            next(error);
        }
    },
    /**
     * Lấy bài post mới nhất 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    getPostInNewsFeedTop: async (req, res, next) => {
        try {
            let user = await User.findById(req.body.userID);
            const doc = await Post.find({
                                    $or: [{
                                            owner: { $in: [user.friends, req.body.userID] },
                                        }, {
                                            belongToGroup: { $in: user.groups }
                                        }]
                                    })
                                    .populate('belongToGroup', 'name')
                                    .sort({updatedAt: -1})
                                    .skip(0)
                                    .limit(-1);
            const totalRecord = await Post.count();
            res.status(200).json({
                status: 'success',
                doc
            });                        
        } catch (error) {
            next(error);
        }
    },
}