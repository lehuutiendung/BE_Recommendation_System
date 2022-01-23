const Base = require("./base.controller");
const User = require("../models/user.model");
const Post = require("../models/post.model");
const FriendRequest = require("../models/friend-request.model");
const RequestEnum = require("../enums/request");

module.exports = {
    allAccess: (req, res) => {
        res.status(200).send("Public Content.");
    },

    userBoard: (req, res) => {
        res.status(200).send("User Content.");
    },

    adminBoard: (req, res) => {
        res.status(200).send("Admin Content.");
    },

    moderatorBoard: (req, res) => {
        res.status(200).send("Moderator Content.");
    },
    //Lấy data user theo id
    getUser: Base.getOne(User),
    
    //Cập nhật các trường thông tin cơ bản của user
    updateUser: Base.updateOne(User),

    //Cập nhật avatar user ( route )

    //Cập nhật background user ( route )

    //Tìm kiếm user
    //TODO: Fix search tiếng việt
    filterUser: async (req, res, next) => {
        try {
            const payload = req.body.name.trim();
            const pageSize = req.body.pageSize;
            const pageIndex = req.body.pageIndex;
            const doc = await User.find({ userNameEng : {$regex: new RegExp(payload, 'i')} })
                                    .skip(pageSize*pageIndex - pageSize)
                                    .limit(pageSize);
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }
            
            const totalRecord = await User.find({ userNameEng : {$regex: new RegExp(payload, 'i')} }).count();
            const totalPage = Math.ceil(totalRecord / pageSize);

            res.status(200).json({
                status: 'Success',
                doc,
                totalPage: totalPage
            })
        } catch (error) {
            next(error);
        }
    },

    //Filter trong top bạn bè của một người dùng
    filterFriend: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const pageIndex = req.body.pageIndex;
            const doc = await User.findById(req.body.userID)
                                    .populate({ path:'friends', select: ['avatar', 'friends', 'userName', 'userNameEng', '_id']})
                                    .select('userName email friends')
                                    .skip(pageSize*pageIndex - pageSize)
                                    .limit(pageSize);
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }

            res.status(200).json({
                status: 'Success',
                doc,
            })
        } catch (error) {
            next(error);
        }
    },

    //Paging kho hình ảnh của người dùng
    getImageLibrary: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const pageIndex = req.body.pageIndex;
            const doc = await Post.find({
                                    owner: req.body.userID , image: { $exists: true, $not: {$size: 0} }
                                    })
                                    .sort({updatedAt: -1})
                                    .skip(pageSize*pageIndex - pageSize)
                                    .limit(pageSize);

            const totalRecord = await await Post.find({
                                                owner: req.body.userID , image: { $exists: true, $not: {$size: 0} }
                                                }).count();
            const totalPage = Math.ceil(totalRecord / pageSize);                        
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }

            res.status(200).json({
                status: 'Success',
                doc,
                totalPage: totalPage
            })
        } catch (error) {
            next(error);
        }
    },

    // Gửi request kết bạn
    sendRequestAddFriend: async (req, res, next) => {
        try {
            const userRequestID = req.body.userRequestID;
            const userRecipientID = req.body.userRecipientID;
            
            const existsDoc = await FriendRequest.find({
                userRecipientID: userRecipientID,
                userRequestID: userRequestID
            })
            if(existsDoc.length > 0){
                res.status(200).json({
                    status: 'Document already exists',
                    data: {
                        existsDoc
                    }
                });
                return;
            }

            const friendRequest = new FriendRequest({
                userRequestID: userRequestID,
                userRecipientID: userRecipientID,
                status: RequestEnum.REQUESTED,
                seen: false
            })

            const doc = await FriendRequest.create(friendRequest);
            res.status(201).json({
                status: 'Success',
                data: {
                    doc
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // Gửi request đồng ý kết bạn
    sendRequestAcceptFriend: async (req, res, next) => {
        try {
            const doc = await FriendRequest.findByIdAndUpdate(req.params.id, {
                $set:{
                    status: RequestEnum.ACCEPTED,
                    seen: true
                }
            }, {
                new: true,                              //return updated doc
                runValidators: true                     //validate before update
            })
            
            //Thêm người chấp nhận kết bạn vào list friend của người gửi request
            const docUserRequested = await User.findByIdAndUpdate(req.body.userRequestID, {
                $push:{
                    friends: req.body.userRecipientID
                }
            }, {
                new: true,                              //return updated doc
                runValidators: true                     //validate before update
            })

            //Thêm người gửi yêu cầu kết bạn vào list friend người chấp nhận kết bạn
            const docUserRecipiented = await User.findByIdAndUpdate(req.body.userRecipientID, {
                $push:{
                    friends: req.body.userRequestID
                }
            }, {
                new: true,                              //return updated doc
                runValidators: true                     //validate before update
            })
            
        
            res.status(200).json({
                status: 'Success',
                data: {
                    doc,
                    docUserRequested,
                    docUserRecipiented
                }
            })
        } catch (error) {
            next(error);
        }
    },

    // Request từ chối lời mời kết bạn
    sendRequestRejectFriend: async (req, res, next) => {
        try {
            const doc = await FriendRequest.findByIdAndDelete(req.params.id);
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
    },

    // Lấy những thông báo chưa xem
    getNotificationAddFriend: async (req, res, next) => {
        try {
            const doc = await FriendRequest.find(
                {
                    userRecipientID: req.body.userID,
                    status: 1,                      //Trạng thái requested
                    seen: false
                }).populate('userRequestID')
            let dataRes = [];
            doc.forEach(element => {
                let objectNotify = {
                    id: element._id,
                    userRecipientID: element.userRecipientID,
                    userRequestID: element.userRequestID._id,
                    avatar: element.userRequestID.avatar.cloudinaryID,
                    userName: element.userRequestID.userName,
                    seen: element.seen,
                    status: element.status,
                    createdAt: element.createdAt,
                    updatedAt: element.updatedAt
                }
                dataRes.push(objectNotify);
            });
            res.status(200).json({
                status: 'Success',
                dataRes
            })
        } catch (error) {
            next(error);
        }
    },

}