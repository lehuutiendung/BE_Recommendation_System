const express = require('express');
const router = express.Router();
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");
const fs = require("fs");
const chatController = require("../controllers/chat.controller");
module.exports = router;

router.post("/save-img-cloud", upload.array('image'), async (req, res, next) => {
    try {
        let urls = [];
        if(req.files.length > 0){
            const uploader = async (path) => await cloudinary.uploads(path, 'Chat');
            const files = req.files;
            for( const file of files ){
                const { path } = file;
                const newPath = await uploader(path);
                urls.push(newPath);
                fs.unlinkSync(path);
            }
        }
        res.status(200).json({
            status: 'Success',
            success: true,
            urls
        });
    } catch (error) {
        next(error);
    }
})

router.post('/paging-message', chatController.pagingMessage);