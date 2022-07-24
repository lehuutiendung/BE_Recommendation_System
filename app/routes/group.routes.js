const express = require('express');
const router = express.Router();
const AppError = require("../utils/appError")
const groupController = require("../controllers/group.controller");
const Group = require("../models/group.model");
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");
const fs = require("fs");

var convertLanguage = require("../utils/language.convert");

module.exports = router;

/** 
 * @swagger 
 * /api/groups:
 *   post: 
 *      tags: [Group] 
 *      summary: Tạo nhóm
 *      description: Tạo nhóm
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/", upload.single('background'), async (req, res, next) => {
    try {
        let url;
        if(req.file){
            const uploader = async (path) => await cloudinary.uploads(path, 'Group');
            const { path } = req.file;
            url = await uploader(path);
            fs.unlinkSync(path);
        }
        const nameGroupEng = convertLanguage.nonAccentVietnamese(req.body.name);
        const group = new Group({
            name: req.body.name,
            nameGroupEng: nameGroupEng,
            admin: req.body.admin,
            members: req.body.admin,
            general: req.body.general,
            background: url
        })
        try{
            const doc = await Group.create(group);
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
 * /api/groups/{:id}:
 *   put: 
 *      tags: [Group] 
 *      summary: Cập nhật nhóm
 *      description: Cập nhật nhóm
 *      responses:  
 *       200: 
 *         description: Success  
 */
 router.put("/:id", upload.single('background'), async(req, res, next) => {
    try{
        const beforeUpdateDoc = await Group.findById(req.params.id);
        if(!beforeUpdateDoc){
            return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
        }
        
        let url;
        let oldImage = req.body.oldImage;
        if(beforeUpdateDoc.background){
            let file = beforeUpdateDoc.background;
            if(oldImage !== file.imageURL){
                await cloudinary.cloudinary.uploader.destroy(file.cloudinaryID);
            }else{
                url = file;
            }
        }

        if(req.file){
            const uploader = async (path) => await cloudinary.uploads(path, 'Group');
            const { path } = req.file;
            url = await uploader(path);
            fs.unlinkSync(path);
        }
        const nameGroupEng = convertLanguage.nonAccentVietnamese(req.body.name);
        const data = {
            name: req.body.name,
            nameGroupEng: nameGroupEng,
            admin: req.body.admin,
            members: req.body.members,
            general: req.body.general,
            background: url
        }

        const doc = await Group.findByIdAndUpdate(req.params.id, data, {
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
 * /api/groups/{:id}:
 *   delete: 
 *      tags: [Group] 
 *      summary: Xóa nhóm
 *      description: Xoá nhóm
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.delete("/:id", groupController.deleteGroupByID);

/** 
 * @swagger 
 * /api/groups/{:id}:
 *   get: 
 *      tags: [Group] 
 *      summary: Lấy nhóm theo id 
 *      description: Lấy nhóm theo id
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/group-detail", groupController.getGroupByID);

/** 
 * @swagger 
 * /api/groups/paging:
 *   post:
 *      tags: [Group] 
 *      summary: Lấy nhóm phân trang 
 *      description: Lấy nhóm phân trang
 *      responses:  
 *       201: 
 *         description: Success  
 */
 router.post("/paging", groupController.getGroupPaging);

/** 
 * @swagger 
 * /api/groups/join-group:
 *   post:
 *      tags: [Group] 
 *      summary: Theo dõi nhóm
 *      description: Theo dõi nhóm
 *      responses:  
 *       200: 
 *         description: Success  
 */
 router.post("/join-group", groupController.joinGroup);

 /** 
 * @swagger 
 * /api/groups/join-group:
 *   post:
 *      tags: [Group] 
 *      summary: Bỏ theo dõi nhóm
 *      description: Bỏ theo dõi nhóm
 *      responses:  
 *       200: 
 *         description: Success  
 */
  router.post("/out-group", groupController.outGroup);

/** 
 * @swagger 
 * /api/groups/get-all-member:
 *   post:
 *      tags: [Group] 
 *      summary: Lấy tất cả thành viên của nhóm
 *      description: Lấy tất cả thành viên của nhóm
 *      responses:  
 *       200: 
 *         description: Success  
 */
  router.post("/filter-member", groupController.filterMember);

/** 
 * @swagger 
 * /api/groups/filter-group:
 *   post:
 *      tags: [Group] 
 *      summary: Tìm kiếm nhóm
 *      description: Tìm kiếm nhóm
 *      responses:  
 *       200: 
 *         description: Success  
 */
  router.post("/filter-group", groupController.filterGroup);