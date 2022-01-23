const express = require('express');
const router = express.Router();
const AppError = require("../utils/appError")
const commentController = require("../controllers/comment.controller");
const Comment = require("../models/comment.model");
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");
const fs = require("fs");
module.exports = router;

/** 
 * @swagger 
 * /api/comments:
 *   post: 
 *      tags: [Comment] 
 *      summary: Tạo bình luận
 *      description: Tạo bình luận mới
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/", upload.array('image'), async (req, res, next) => {
    try {
        const urls = [];
        if(req.files.length > 0){
            const uploader = async (path) => await cloudinary.uploads(path, 'Comment');
            const files = req.files;
            for( const file of files ){
                const { path } = file;
                const newPath = await uploader(path);
                urls.push(newPath);
                fs.unlinkSync(path);
            }
        }
        const comment = new Comment({
            post: req.body.post,
            owner: req.body.owner,
            content: req.body.content,
            image: urls,
        })
        try{
            const doc = await Comment.create(comment);
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
 * /api/comments/{:id}:
 *   put: 
 *      tags: [Comment] 
 *      summary: Sửa bình luận
 *      description: Sửa bình luận
 *      responses:  
 *       200: 
 *         description: Success  
 */
 router.put("/:id", upload.array('image'), async(req, res, next) => {
    try{
        const beforeUpdateDoc = await Comment.findById(req.params.id);
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
            const uploader = async (path) => await cloudinary.uploads(path, 'Comment');
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
            post: req.body.post,
            owner: req.body.owner,
            content: req.body.content,
            image: urls,
        }

        const doc = await Comment.findByIdAndUpdate(req.params.id, data, {
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
 * /api/comments/{:id}:
 *   delete: 
 *      tags: [Comment] 
 *      summary: Xóa bình luận
 *      description: Xoá bình luận
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.delete("/:id", commentController.deleteCommentByID);

/** 
 * @swagger 
 * /api/comments/{:id}:
 *   get: 
 *      tags: [Comment] 
 *      summary: Lấy bình luận theo id 
 *      description: Lấy bình luận theo id
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.get("/:id", commentController.getCommentByID);

/** 
 * @swagger 
 * /api/comments/all:
 *   post:
 *      tags: [Comment] 
 *      summary: Lấy tất cả bình luận 
 *      description: Lấy tất cả bình luận
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/all", commentController.getCommentAll);
/** 
 * @swagger 
 * /api/comments/paging:
 *   post:
 *      tags: [Comment] 
 *      summary: Lấy phân trang bình luận 
 *      description: Lấy phân trang bình luận
 *      responses:  
 *       201: 
 *         description: Success  
 */
 router.post("/paging", commentController.getCommentPaging);

