const Base = require("./base.controller");
const User = require("../models/user.model");
const Post = require("../models/post.model");
const Group = require("../models/group.model");
const Notification = require("../models/notification.model");
const RequestEnum = require("../enums/request");
var convertLanguage = require("../utils/language.convert");
const {ObjectId} = require('mongodb');
const bcrypt = require("bcryptjs");

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
    getUser: async (req, res, next) => {
        try {
            let data = await User.findById(req.params.id);
            if(!data){
                res.status(200).json({
                    Success: false,
                    code: "USER_NOT_EXISTS",
                    message: "This user currently does not exist"
                })
                return;
            }

            let doc = {
                _id: data._id,
                avatar: data.avatar,
                background: data.background,
                createdAt: data.createdAt,
                dateOfBirth: data.dateOfBirth,
                email: data.email,
                ethnic: data.ethnic,
                friends: data.friends,
                gender: data.gender,
                groups: data.groups,
                hometown: data.hometown,
                isOnline: data.isOnline,
                nationality: data.nationality,
                phoneNumber: data.phoneNumber,
                quotes: data.quotes,
                religion: data.religion,
                socketID: data.socketID,
                updatedAt: data.updatedAt,
                userID: data.userID,
                userName: data.userName,
                userNameEng: data.userNameEng
            }

            res.status(200).json({
                status: 'success',
                Success: true,
                doc
            });

        } catch (error) {
            next(error);
        }
    },
    
    //Cập nhật các trường thông tin cơ bản của user
    updateUser: Base.updateOne(User),

    //Cập nhật avatar user ( route )

    //Cập nhật background user ( route )

    //Tìm kiếm user
    filterUser: async (req, res, next) => {
        try {
            const payload = convertLanguage.nonAccentVietnamese(req.body.name.trim());
            const pageSize = req.body.pageSize;
            const pageIndex = req.body.pageIndex;

            // payload = convertLanguage.nonAccentVietnamese(payload);
            // const doc = await User.find({ $text: {$search: payload } })
            const doc = await User.find({ userNameEng : {$regex: new RegExp(payload, 'i')} })
                                    // .skip(pageSize*pageIndex - pageSize)
                                    // .limit(pageSize);
            if(!doc){
                return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
            }
            
            const totalRecord = await User.find({ $text: {$search: payload } }).count();
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

    //Filter và paging danh sách bạn bè của người dùng
    filterFriend: async (req, res, next) => {
        try {
            const pageSize = req.body.pageSize;
            const pageIndex = req.body.pageIndex;
            const userID = req.body.userID;
            const payload = convertLanguage.nonAccentVietnamese(req.body.userName.trim());
            const doc = await User.findById(userID)
                                    .populate({ 
                                        path:'friends', 
                                        select: ['_id', 'userName', 'userNameEng', 'avatar'],
                                        match: {
                                            $or: [
                                                { userNameEng : {$regex: new RegExp(payload, 'i')} }
                                            ]
                                        }
                                    })
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

    // Lưu thông báo và các yêu cầu
    saveNotification: async (req, res, next) => {
        try {
            const userRequestID = req.body.userRequestID;
            const userRecipientID = req.body.userRecipientID;
            const typeNoti = req.body.typeNoti;
            const status = req.body.status;
            const postID = req.body.postID;

            //Check tồn tại request đối với gửi lời mời kết bạn
            if(typeNoti == 0){
                const existsDoc = await Notification.find({
                    userRecipientID: userRecipientID,
                    userRequestID: userRequestID,
                    typeNoti: 0
                })
                if(existsDoc.length > 0){
                    res.status(200).json({
                        status: 'Document already exists',
                        success: false,
                        data: {
                            existsDoc
                        }
                    });
                    return;
                }
            }

            const notification = new Notification({
                userRequestID: userRequestID,
                userRecipientID: userRecipientID,
                status: status,
                seen: false,
                typeNoti: typeNoti,
                postID: postID
            })

            const doc = await Notification.create(notification);
            res.status(201).json({
                status: 'Success',
                success: true,
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
            const doc = await Notification.findByIdAndUpdate(req.params.id, {
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
            const doc = await Notification.findByIdAndDelete(req.params.id);
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

    // Hủy kết bạn
    deleteFriend: async(req, res, next) => {
        try {
            let ownerID = req.body.ownerID;
            let friendID = req.body.friendID;
            const docOwner = await User.findByIdAndUpdate(ownerID, {
                $pull: {'friends': ObjectId(friendID) } 
            })
            if(!docOwner){
                res.status(200).json({
                    status: 'Success',
                    success: false,
                    code: "USER_NOT_EXIST",
                    message: "This user does not exist"
                }) 
            }
            const docFriend = await User.findByIdAndUpdate(friendID, {
                $pull: {'friends': ObjectId(ownerID) } 
            })
            if(!docFriend){
                res.status(200).json({
                    status: 'Success',
                    success: false,
                    code: "USER_NOT_EXIST",
                    message: "This user does not exist"
                }) 
            }
            const docFriendReq = await Notification.findOneAndDelete({
                $or:[
                    {
                        userRecipientID: ownerID,
                        userRequestID: friendID,
                        typeNoti: 0
                    },
                    {
                        userRecipientID: friendID,
                        userRequestID: ownerID,
                        typeNoti: 0
                    }
                ]
            })
            res.status(200).json({
                status: 'Success',
                success: true
            })
        } catch (error) {
            next(error);
        }
    },

    // Lấy những thông báo chưa xem
    getNotificationNotSeen: async (req, res, next) => {
        try {
            const doc = await Notification.find({   
                $or:[{
                        //Thông báo về kết bạn
                        userRecipientID: req.body.userID,
                        status: 1,                      //Trạng thái requested
                        seen: false
                    },
                    {
                        //Các thông báo khác
                        userRecipientID: req.body.userID,
                        status: 4                       
                    }]
                }).populate('userRequestID').sort({updatedAt: -1});
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
                    typeNoti: element.typeNoti,
                    postID: element.postID,
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

    
    // Lấy tất cả trạng thái online, offline của bạn bè và các nhóm người dùng tham gia
    getStatusOfFriend: async(req, res, next) => {
        try {
            let userID = req.body.userID;
            const doc = await User.findById(userID).populate("friends", "userID avatar userName userNameEng isOnline").populate('groups', 'name nameGroupEng background general');
            // Lấy danh sách group người dùng đã tạo
            const docGroupOwner = await Group.find({ admin: userID }).select('name nameGroupEng background general');
            // Sắp xếp danh sách bạn bè online lên đầu tiên
            let lstFriends = doc.friends.sort((x, y) => y.isOnline - x.isOnline);
            // Merge 2 list: list người dùng tham gia + list người dùng tạo
            let lstGroups = [...doc.groups,...docGroupOwner];
            res.status(200).json({
                status: 'Success',
                success: true,
                lstFriends,
                lstGroups
            })
        } catch (error) {
            next(error);
        }
    },

    // Cập nhật trạng thái đã xem thông báo
    updateStatusNoti: async(req, res, next) => {
        try {
            const doc = await Notification.findOneAndUpdate({ _id: req.body.notiID }, {
                $set:{
                    seen: true
                }
            }, {
                new: true,                              //return updated doc
                runValidators: true                     //validate before update
            })

            if(!doc){
                res.status(200).json({
                    status: 'Success',
                    success: false,
                    code: "POST_NOT_EXIST",
                    message: "This post does not exist"
                })
                return;
            }

            res.status(200).json({
                status: 'Success',
                success: true,
                doc
            })
        } catch (error) {
            throw error;
        }
    },

    //Thiết lập - thay đổi mật khẩu
    changePasswordSetting: async(req, res, next) => {
        try {
            const currentPassword = req.body.currentPassword;
            const newPassword = req.body.newPassword;
            const userID = req.body.userID;
            var docUser = await User.findById(userID);
            var passwordIsValid = bcrypt.compareSync(
                currentPassword,
                docUser.password
            );
            if(currentPassword == "" || newPassword == ""){
                // Nhập thiếu các trường bắt buộc
                res.status(200).json({
                    status: 'Success',
                    success: false,
                    code: "EMPTY_VALUE"
                })
                return;
            }else if(!passwordIsValid){
                // Mật khẩu hiện tại không đúng
                res.status(200).json({
                    status: 'Success',
                    success: false,
                    code: "PASSWORD_INVALID"
                })
                return;
            }else{
                const doc = await User.findByIdAndUpdate(userID, {
                    $set:{
                        password: bcrypt.hashSync(newPassword, 8)
                    }
                })
    
                res.status(200).json({
                    status: 'Success',
                    success: true
                })
            }
        } catch (error) {
            throw error;
        }
    }
}