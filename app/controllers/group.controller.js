const Group = require("../models/group.model");
const AppError = require("../utils/appError");
const User = require("../models/user.model");
const Base = require("./base.controller");
const {cloudinary} = require("../config/cloudinary.config");
const { mongoose } = require("../models/common.model");

module.exports = {
    // Tạo group: Trong router ( upload file)
    // Cập nhật group: Trong router

    //Lấy dữ liệu group theo ID
    // getGroupByID: Base.getOne(Group),
    getGroupByID: async (req, res, next) => {
        try {
            const doc = await Group.findById(req.params.id).populate('admin', 'userName avatar');
            if(!doc){
                res.status(200).json({
                    success: false,
                    log: "No document found!",
                    data: null
                })
                // return next( new AppError(404, 'Failed', 'No document found!'), req, res, next);
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

    //Lấy dữ liệu paging group
    getGroupPaging: async (req, res, next) => {
        try {
            const payload = req.body.name.trim();
            const pageSize = req.body.pageSize;
            const pageIndex = req.body.pageIndex;
            const userID = req.body.userID;
            var doc = await Group.find({ nameGroupEng : {$regex: new RegExp(payload, 'i')} })
                                    .sort({'_id': -1})
                                    .skip(pageSize*pageIndex - pageSize)
                                    .limit(pageSize);
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }

            //Đưa thuộc tính check contain vào list object paging
            let listDataJSON = await module.exports.convertAndCheckData(userID, doc);
            const totalRecord = await Group.find({ nameGroupEng : {$regex: new RegExp(payload, 'i')} }).count();
            const totalPage = Math.ceil(totalRecord / pageSize);

            res.status(200).json({
                status: 'Success',
                success: true,
                data: {
                    doc: listDataJSON,
                    totalPage: totalPage
                }
            })
        } catch (error) {
            console.log(error);
        }
    },

    //Xóa group
    deleteGroupByID: async (req, res, next) => {
        try {
            const doc = await Group.findByIdAndDelete(req.params.id);
            // Nếu bản ghi có kèm hình ảnh được lưu trên Cloudinary => Xóa kèm hình ảnh trên Cloudinary
            if(doc.background && doc.background.cloudinaryID){
                let file = doc.background;
                await cloudinary.uploader.destroy(file.cloudinaryID);
            }
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }
    
            res.status(204).json({
                status: 'Success',
                success: true,
                data: null
            })
        } catch (error) {
            next(error);
        }
    },

    //Theo dõi group
    joinGroup: async (req, res, next) => {
        try {
            const doc = await Group.findByIdAndUpdate(req.body.groupID, {
                $addToSet: {
                    members: req.body.userID
                }
            })
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }

            const docUser = await User.findByIdAndUpdate(req.body.userID, {
                $addToSet: {
                    groups: req.body.groupID
                }
            })
            if(!docUser){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }

            res.status(200).json({
                status: 'Success',
                success: true
            })
        } catch (error) {
            next(error);
        }
    },

    //Bỏ theo dõi group
    outGroup: async (req, res, next) => {
        try {
            const doc = await Group.findByIdAndUpdate(req.body.groupID, {
                $pull: {
                    members: req.body.userID
                }
            })
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }

            const docUser = await User.findByIdAndUpdate(req.body.userID, {
                $pull: {
                    groups: req.body.groupID
                }
            })
            if(!docUser){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }

            res.status(200).json({
                status: 'Success',
                success: true
            })
        } catch (error) {
            next(error);
        }
    },

    //Kiểm tra người dùng đã tham gia group hay chưa
    checkContainUser: async (userID, groupID) => {
        try {
            const group = await Group.findById(groupID);
            return group.members.includes(userID);
        } catch (error) {
            next(error);
        }
    },

    // Convert array object mongodb, add trường kiểm tra user tham gia group
    convertAndCheckData: async (userID, data) => {
        try {
            let listDataJSON = [];
            for (let i = 0; i < data.length; i++) {
                let objConverted = data[i].toObject();
                await module.exports.checkContainUser(userID, data[i].id)
                .then((result) => {
                    objConverted.userJoined = result;
                })
                .then(()=> {
                    listDataJSON.push(objConverted);
                });
            }
            return listDataJSON;
        } catch (error) {
            next(error);
        }
    } 
}
