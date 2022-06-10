const Comment = require("../models/comment.model");
const Base = require("./base.controller");
const { mongoose } = require("../models/common.model");

module.exports = {
    // Tạo comment: Trong router ( upload file)
    // Cập nhật comment: Trong router

    //Xóa bình luận
    deleteCommentByID: Base.deleteOne(Comment),

    //Lấy tất cả dữ liệu bình luận 
    getCommentAll: Base.getAll(Comment),

    //Lấy dữ liệu 1 bình luận theo ID
    getCommentByID: Base.getOne(Comment),

    //Lấy dữ lieuj paging bình luận
    getCommentPaging: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const doc = await Comment.find({post: mongoose.Types.ObjectId(req.body.post)})
                                    .populate('owner', 'userName avatar')
                                    .sort({updatedAt: -1})
                                    .skip(pageSize*req.body.pageIndex - pageSize)
                                    .limit(pageSize);
            const totalRecord = await Comment.find({post: mongoose.Types.ObjectId(req.body.post)}).count();
            const totalPage = Math.ceil(totalRecord / pageSize);
            res.status(200).json({
                status: 'success',
                data:{
                    doc,
                    totalPage: totalPage,
                    totalRecord: totalRecord
                }
            });                        
        } catch (error) {
            next(error);
        }
    },
}