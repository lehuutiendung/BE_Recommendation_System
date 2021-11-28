const AppError = require("../utils/appError");
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");

/**
 * Lấy tất cả bản ghi
 * @param {*} Model 
 * @returns 
 */
exports.getAll = Model => async (req, res, next) => {
    try {
        // Sắp xếp bản ghi theo thời gian gần nhất
        const doc = await Model.find({}).sort({ "createdAt":-1 });
        
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
            data:{
                doc
            }
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
        if(doc.cloudinaryID){
            await cloudinary.uploader.destroy(doc.cloudinaryID);
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