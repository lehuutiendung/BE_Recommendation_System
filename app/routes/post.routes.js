const express = require('express');
const router = express.Router();
const AppError = require("../utils/appError")
const postController = require("../controllers/post.controller");
const Post = require("../models/post.model");
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");
const fs = require("fs");
module.exports = router;

/** 
 * @swagger 
 * /api/posts:
 *   post: 
 *      tags: [Post] 
 *      summary: Tạo bài viết
 *      description: Tạo bài viết mới
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/", upload.array('image'), async (req, res, next) => {
    try {
        // Sinh mã ID cho bài viết
        var postID = 1;
        var docMaxPostID = await Post.findOne().sort({postID:-1}).limit(1);
        if(docMaxPostID){
            postID = docMaxPostID.postID + 1;
        }
        const urls = [];
        if(req.files.length > 0){
            const uploader = async (path) => await cloudinary.uploads(path, 'Post');
            const files = req.files;
            for( const file of files ){
                const { path } = file;
                const newPath = await uploader(path);
                urls.push(newPath);
                fs.unlinkSync(path);
            }
        }
        const post = new Post({
            postID: postID,
            owner: req.body.owner,
            content: req.body.content,
            image: urls,
            belongToGroup: req.body.belongToGroup,
            react: req.body.react
        })
        try{
            const doc = await Post.create(post);
            res.status(201).json({
                status: 'Success',
                data: {
                    doc
                }
            });
        } catch (error) {
            next(error);
        }
    } catch (error) {
        next(error);
    }
})

/** 
 * @swagger 
 * /api/posts/{:id}:
 *   put: 
 *      tags: [Post] 
 *      summary: Sửa bài viết
 *      description: Sửa bài viết
 *      responses:  
 *       200: 
 *         description: Success  
 */
 router.put("/:id", upload.array('image'), async(req, res, next) => {
    try{
        const beforeUpdateDoc = await Post.findById(req.params.id);
        if(!beforeUpdateDoc){
            return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
        }
        let urls = [];
        //Lọc ra những hình ảnh không thay đổi khi yêu cầu cập nhật
        let listOldImage = req.body.oldImage.split(',');
        let isUpdateImage = false;          //Biến xác nhận trong req có cập nhật hình ảnh mới hay không
        if(beforeUpdateDoc.image.length > 0){
            for(const file of beforeUpdateDoc.image){
                if(!listOldImage.includes(file.imageURL)){
                    await cloudinary.cloudinary.uploader.destroy(file.cloudinaryID);
                    isUpdateImage = true;
                }else{
                    urls.push(file);
                }
            }
        }
        if(req.files.length > 0){
            const uploader = async (path) => await cloudinary.uploads(path, 'Post');
            const files = req.files;
            for( const file of files ){
                const { path } = file;
                const newPath = await uploader(path);
                urls.push(newPath);
                fs.unlinkSync(path);
            }
        }else{
            if(!isUpdateImage){
                urls = beforeUpdateDoc.image;
            }
        }
        
        const data = {
            postID: req.body.postID,
            owner: req.body.owner,
            content: req.body.content,
            image: urls,
            belongToGroup: req.body.belongToGroup,
            react: req.body.react
        }

        const doc = await Post.findByIdAndUpdate(req.params.id, data, {
            new: true,                              //return updated doc
            runValidators: true                     //validate before update
        })

        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        })
    } catch (error) {
        next(error);
    }
})

/** 
 * @swagger 
 * /api/posts/{:id}:
 *   delete: 
 *      tags: [Post] 
 *      summary: Xóa bài viết
 *      description: Xoá bài viết
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.delete("/:id", postController.deletePostByID);

/** 
 * @swagger 
 * /api/posts/{:id}:
 *   get: 
 *      tags: [Post] 
 *      summary: Lấy bài viết theo id 
 *      description: Lấy bài viết theo id
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.get("/:id", postController.getPostByID);

/** 
 * @swagger 
 * /api/posts/all:
 *   post:
 *      tags: [Post] 
 *      summary: Lấy tất cả bài viết 
 *      description: Lấy tất cả bài viết
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/all", postController.getPostAll);

/** 
 * @swagger 
 * /api/posts/paging:
 *   post:
 *      tags: [Post] 
 *      summary: Lấy bài viết phân trang 
 *      description: Lấy bài viết phân trang
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/paging", postController.getPostInNewsFeed);

/** 
 * @swagger 
 * /api/posts/paging/ingroup:
 *   post:
 *      tags: [Post] 
 *      summary: Lấy bài viết phân trang trong group
 *      description: Lấy bài viết phân trang trong group
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/paging/ingroup", postController.getPostPagingInGroup);

router.post("/paging/inwall", postController.getPostInWall);

router.post("/top-post", postController.getPostInNewsFeedTop);

// Tương tác cảm xúc với bài viết 
router.post("/post-react", postController.reactToPost);