const express = require('express');
const router = express.Router();
const AppError = require("../utils/appError")
const postController = require("../controllers/post.controller");
const Post = require("../models/post.model");
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");

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
router.post("/", upload.single('image'), async(req, res, next) => {
    let imgURL = null;
    let cloudinaryID = null;
    if(req.file){
        let result = await cloudinary.uploader.upload(req.file.path);
        imgURL = result.secure_url;
        cloudinaryID = result.public_id;
    }
    
    const post = new Post({
        owner: req.body.owner,
        content: req.body.content,
        imageURL: imgURL,
        cloudinaryID: cloudinaryID,
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
 router.put("/:id", upload.single('image'), async(req, res, next) => {
    try{
        const beforeUpdateDoc = await Post.findById(req.params.id);
        if(!beforeUpdateDoc){
            return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
        }

        let newImageURL = null;
        let newCloudinaryID = null; 
        if(req.file){
            if(beforeUpdateDoc.cloudinaryID){
                await cloudinary.uploader.destroy(beforeUpdateDoc.cloudinaryID);
            }
            result = await cloudinary.uploader.upload(req.file.path);
            newImageURL = result.secure_url;
            newCloudinaryID = result.public_id;
        }
        
        const data = {
            owner: req.body.owner || beforeUpdateDoc.owner,
            content: req.body.content || beforeUpdateDoc.content,
            imageURL: newImageURL || beforeUpdateDoc.imageURL,
            cloudinaryID: newCloudinaryID || beforeUpdateDoc.cloudinaryID ,
            belongToGroup: req.body.belongToGroup || beforeUpdateDoc.belongToGroup,
            react: req.body.react || beforeUpdateDoc.react
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

