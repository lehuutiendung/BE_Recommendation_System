const Post = require("../models/post.model");
const User = require("../models/user.model");
const React = require("../models/react.model");
const Base = require("./base.controller");
const mongoose = require('mongoose');
const State = require("../enums/state.js");
const AppError = require("../utils/appError");
const {cloudinary} = require("../config/cloudinary.config");

module.exports = {
    // Tạo bài viết: Trong router ( upload file)
    // Cập nhật bài viết: Trong router

    //Xóa bài viết
    deletePostByID: async(req, res, next) => {
        try {
            const doc = await Post.findByIdAndDelete(req.params.id);
            // Nếu bản ghi có kèm hình ảnh được lưu trên Cloudinary => Xóa kèm hình ảnh trên Cloudinary
            if(doc.image.length > 0){
                for(const file of doc.image){
                    if(file.resourceType.includes('image')){
                        await cloudinary.uploader.destroy(file.cloudinaryID);
                    }else{
                        await cloudinary.uploader.destroy(file.cloudinaryID, {resource_type : 'video'});
                    }
                }
            }
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }
            const query = { "post" : doc.postID }
            const result = await React.deleteMany(query);
    
            res.status(204).json({
                status: 'Success',
                data: null
            })
        } catch (error) {
            next(error);
        }
    },

    //Lấy dữ liệu tất cả bài viết
    getPostAll: Base.getAll(Post),

    //Lấy dữ liệu bài viết theo ID
    getPostByID: async (req, res, next) => {
        try {
            const doc = await Post.findById(req.params.id)
                                    .populate('owner', 'userName avatar')
                                    .populate('belongToGroup', 'name') ;
            if(!doc){
                res.status(200).json({
                    success: false,
                    log: "No document found!",
                    data: null
                })
            }
    
            res.status(200).json({
                status: 'success',
                success: true,
                doc
            });
        } catch (error) {
            next(error);
        }
    },

    //Paging bài viết trong group
    getPostPagingInGroup: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const groupID = req.body.groupID;
            const doc = await Post.find({belongToGroup: mongoose.Types.ObjectId(groupID)})
                                    .populate('owner', 'userName avatar')
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

    //Lấy paging bài viết trên newsfeed
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
                                    .populate('owner', 'userName avatar')
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
    
    // Paging bài viết trên trang cá nhân
    getPostInWall: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const doc = await Post.find({
                                    owner: req.body.userID,
                                    })
                                    .populate('belongToGroup', 'name')
                                    .populate('owner', 'userName avatar')
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

    // Lấy bài post mới nhất 
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
                                    .populate('owner', 'userName avatar')
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
    
    // Tương tác với bài viết: like, love, haha, wow, sad, angry
    reactToPost: async (req, res, next) => {
        try {
            let state = req.body.state;
            var doc;
            // Check bài viết có tồn tại hay không
            docPost = await Post.findOne({ postID: req.body.postID });
            if(!docPost){
                res.status(200).json({
                    success: false,
                    message: "The post does not exist"
                });
            }
            var lstReactOfPost = docPost.react;
            console.log(docPost);
            // Check có tồn tại bản ghi react hay không
            const oldValue = await React.findOne({ post :  req.body.postID, owner: req.body.owner});
            if(!oldValue){
                // Insert bản ghi tương tác bài viết
                const data = new React({
                    post: req.body.postID,
                    owner: req.body.owner,
                    reactType: req.body.reactType
                })
                
                // Tạo bản ghi ở bảng React
                doc = await React.create(data);

                lstReactOfPost.push({
                    userID: req.body.owner,
                    reactType: req.body.reactType
                })
                // Update mảng react của model Post
                await Post.findByIdAndUpdate(docPost._id, {
                    $set:{
                        react: lstReactOfPost,
                    }
                })
            }else{
                if(state == State.UPDATE){
                    lstReactOfPost.forEach(ele => {
                        if(ele.userID == req.body.owner){
                            ele.reactType = req.body.reactType;
                        }
                    });
                    // Update mảng react của model Post
                    await Post.findByIdAndUpdate(docPost._id, {
                        $set:{
                            react: lstReactOfPost,
                        }
                    })
                    
                    const data = {
                        post: req.body.postID,
                        owner: req.body.owner,
                        reactType: req.body.reactType
                    }
                    
                    doc = await React.findByIdAndUpdate(oldValue._id, data, {
                        new: true,                              //return updated doc
                        runValidators: true                     //validate before update
                    })
                    
                }
                if(state == State.DELETE){
                    // Trạng thái DELETE => Delete bản ghi react
                    doc = await React.findByIdAndDelete(oldValue._id);
                    // Xóa bản ref react trong bản ghi bài viết
                    lstReactOfPost = lstReactOfPost.filter(x => x.userID != req.body.owner);
                    console.log(lstReactOfPost);
                    await Post.findByIdAndUpdate(docPost._id, {
                        $set:{
                            react: lstReactOfPost,
                        }
                    })
                }
            }
            res.status(200).json({
                status: 'Success',
                success: true,
                data: doc
            })
        } catch (error) {
            next(error);
        }
    }
}