const AppError = require("../utils/appError");
const {cloudinary} = require("../config/cloudinary.config");
const upload = require("../utils/multer");
const User = require("../models/user.model");

var convertLanguage = require("../utils/language.convert");

/**
 * Lấy tất cả bản ghi
 * @param {*} Model 
 * @returns 
 */
exports.getAll = Model => async (req, res, next) => {
    try {
        // Sắp xếp bản ghi theo thời gian gần nhất
        const doc = await Model.find({}).sort({ "updatedAt":-1 });
        
        res.status(200).json({
            status: 'success',
            totalData: doc.length,
            data:{
                doc
            }
        });
    } catch (error) {
        next(error);
    }
}
exports.getPaging = Model => async (req, res, next) => {
    try {
        const pageSize = req.body.pageSize;
        const doc = await Model.find({})
                                .sort({updatedAt: -1})
                                .skip(pageSize*req.body.pageIndex - pageSize)
                                .limit(pageSize);
        const totalRecord = await Model.count();
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
}
/**
 * Lấy 1 bản ghi theo id
 * @param {*} Model 
 * @returns 
 */
exports.getOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findById(req.params.id);
        if(!doc){
            return next( new AppError(404, 'Failed', 'No document found!'), req, res, next);
        }

        res.status(200).json({
            status: 'success',
            Success: true,
            doc
        });
    } catch (error) {
        next(error);
    }
}
/**
 * Tạo 1 bản ghi
 * @param {*} Model 
 * @returns 
 */
exports.createOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.create(req.body);

        res.status(201).json({
            status: 'Success',
            data: {
                doc
            }
        });

    } catch (error) {
        next(error);
    }
};
/**
 * Cập nhật bản ghi theo id
 * @param {*} Model 
 * @returns 
 */
exports.updateOne = Model => async (req, res, next) => {
    try {
        // Case trường hợp Model là User, update thêm trường userNameEng
        if(Model === User){
            req.body.userNameEng = convertLanguage.nonAccentVietnamese(req.body.userName);
        }
        
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,                              //return updated doc
            runValidators: true                     //validate before update
        })
        if(!doc){
            return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
        }

        res.status(200).json({
            status: 'Success',
            data: {
                doc
            }
        })
    } catch (error) {
        next(error);
    }
}
exports.deleteOne = Model => async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        // Nếu bản ghi có kèm hình ảnh được lưu trên Cloudinary => Xóa kèm hình ảnh trên Cloudinary
        if(doc.image.length > 0){
            for(const file of doc.image){
                await cloudinary.uploader.destroy(file.cloudinaryID);
            }
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