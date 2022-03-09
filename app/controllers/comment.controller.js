const Comment = require("../models/comment.model");
const Base = require("./base.controller");
const { mongoose } = require("../models/common.model");

module.exports = {
    // Tạo comment: Trong router ( upload file)
    // Cập nhật comment: Trong router
    deleteCommentByID: Base.deleteOne(Comment),
    getCommentAll: Base.getAll(Comment),
    getCommentByID: Base.getOne(Comment),
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