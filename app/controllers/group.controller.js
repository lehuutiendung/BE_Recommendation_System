const Group = require("../models/group.model");
const Base = require("./base.controller");
const {cloudinary} = require("../config/cloudinary.config");
const { mongoose } = require("../models/common.model");

module.exports = {
    // Tạo group: Trong router ( upload file)
    // Cập nhật group: Trong router
    getGroupByID: Base.getOne(Group),
    getGroupPaging: async (req, res, next) => {
        try {
            const payload = req.body.name.trim();
            const pageSize = req.body.pageSize;
            const pageIndex = req.body.pageIndex;
            const doc = await Group.find({ nameGroupEng : {$regex: new RegExp(payload, 'i')} })
                                    .skip(pageSize*pageIndex - pageSize)
                                    .limit(pageSize);
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }
            
            const totalRecord = await Group.find({ nameGroupEng : {$regex: new RegExp(payload, 'i')} }).count();
            const totalPage = Math.ceil(totalRecord / pageSize);

            res.status(200).json({
                status: 'Success',
                data: {
                    doc,
                    totalPage: totalPage
                }
            })
        } catch (error) {
            next(error);
        }
    },

    deleteGroupByID: async (req, res, next) => {
        try {
            const doc = await Group.findByIdAndDelete(req.params.id);
            // Nếu bản ghi có kèm hình ảnh được lưu trên Cloudinary => Xóa kèm hình ảnh trên Cloudinary
            if(doc.background){
                let file = doc.background;
                await cloudinary.uploader.destroy(file.cloudinaryID);
            }
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }
    
            res.status(204).json({
                status: 'Success',
                data: null
            })
        } catch (error) {
            next(error);
        }
    }

}