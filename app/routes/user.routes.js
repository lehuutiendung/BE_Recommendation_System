const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware/common.service");
const userController = require("../controllers/user.controller");
const cloudinary = require("../config/cloudinary.config");
const upload = require("../utils/multer");
const User = require("../models/user.model");
const fs = require('fs');

// Định nghĩa router - endpoint
router.get("/all", userController.allAccess);

router.get("/user", userController.userBoard);

router.get(
  "/mod",
  [authJwt.isModerator],
  userController.moderatorBoard
);

router.get(
  "/admin",
  [authJwt.isAdmin],
  userController.adminBoard
);

/** 
 * @swagger 
 * /api/users/{id}:
 *   get: 
 *      tags: [User] 
 *      summary: Lấy thông tin của user theo id
 *      description: Lấy thông tin của user theo id 
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.get("/:id", userController.getUser);

/** 
 * @swagger 
 * /api/users/avatar/{id}:
 *   put: 
 *      tags: [User]
 *      summary: Cập nhật avatar của user 
 *      description: Cập nhật avatar của user
 *      responses:  
 *       200: 
 *         description: Success  
 */
router.put("/avatar/:id", upload.single('avatar'), async(req, res, next) => {
  try{
      const beforeUpdateDoc = await User.findById(req.params.id);
      if(!beforeUpdateDoc){
          return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
      }

      //Xóa ảnh cũ trên cloud
      let file = beforeUpdateDoc.avatar;
      await cloudinary.cloudinary.uploader.destroy(file.cloudinaryID);

      let url;
      if(req.file){
          const uploader = async (path) => await cloudinary.uploads(path, 'Avatar User');
          const { path } = req.file;
          url = await uploader(path);
          fs.unlinkSync(path);
      }

      const doc = await User.findByIdAndUpdate(req.params.id, {
        $set:{
          avatar: url
        }
      }, {
          new: true,                              //return updated doc
          runValidators: true                     //validate before update
      })

      res.status(200).json({
          status: 'Success',
          success: true,
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
 * /api/users/background/{id}:
 *   put: 
 *      tags: [User] 
 *      summary: Cập nhật background của user
 *      description: Cập nhật background của user
 *      responses:  
 *       200: 
 *         description: Success  
 */
 router.put("/background/:id", upload.single('background'), async(req, res, next) => {
  try{
      const beforeUpdateDoc = await User.findById(req.params.id);
      if(!beforeUpdateDoc){
          return next(new AppError(404, 'Failed', 'No document found!'), req, res, next);
      }

      //Xóa ảnh cũ trên cloud
      let file = beforeUpdateDoc.background;
      await cloudinary.cloudinary.uploader.destroy(file.cloudinaryID);

      let url;
      if(req.file){
          const uploader = async (path) => await cloudinary.uploads(path, 'Background User');
          const { path } = req.file;
          url = await uploader(path);
          fs.unlinkSync(path);
      }

      const doc = await User.findByIdAndUpdate(req.params.id, {
        $set:{
          background: url
        }
      }, {
          new: true,                              //return updated doc
          runValidators: true                     //validate before update
      })

      res.status(200).json({
          status: 'Success',
          success: true,
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
 * /api/users/{id}:
 *   put: 
 *      tags: [User] 
 *      summary: Cập nhật các thông tin cơ bản của user theo id
 *      description: Cập nhật các thông tin cơ bản của user theo id 
 *      responses:  
 *       200: 
 *         description: Success  
 */
router.put("/:id", userController.updateUser);

/** 
 * @swagger 
 * /api/users/filter-user:
 *   post: 
 *      tags: [User] 
 *      summary: Tìm kiếm người dùng
 *      description: Tìm kiếm người dùng
 *      responses:  
 *       200: 
 *         description: Success  
 */
router.post("/filter-user", userController.filterUser);

/** 
 * @swagger 
 * /api/users/filter-friend:
 *   post: 
 *      tags: [User] 
 *      summary: Lấy top bạn bè của người dùng
 *      description: Lấy top bạn bè của người dùng
 *      responses:  
 *       200: 
 *         description: Success  
 */
router.post("/filter-friend", userController.filterFriend);

/** 
 * @swagger 
 * /api/users/image-library-user:
 *   post: 
 *      tags: [User] 
 *      summary: Lấy hình ảnh người dùng đã upload ( khô hình ảnh)
 *      description: Lấy hình ảnh người dùng đã upload ( khô hình ảnh)
 *      responses:  
 *       200: 
 *         description: Success  
 */
 router.post("/image-library", userController.getImageLibrary);

/** 
 * @swagger 
 * /api/users/request-addfriend:
 *   post: 
 *      tags: [User] 
 *      summary: Gửi yêu cầu kết bạn
 *      description: Gửi yêu cầu kết bạn
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/request-addfriend", userController.sendRequestAddFriend);

/** 
 * @swagger 
 * /api/users/notification-add-friend:
 *   get: 
 *      tags: [User] 
 *      summary: Lấy thông báo yêu cầu kết bạn chưa xem 
 *      description: Lấy thông báo yêu cầu kết bạn chưa xem 
 *      responses:  
 *       200: 
 *         description: Success  
 */
 router.post("/notification-add-friend", userController.getNotificationAddFriend);

/** 
 * @swagger 
 * /api/users/request-acceptfriend/{id}:
 *   post: 
 *      tags: [User] 
 *      summary: Request đồng ý kết bạn
 *      description: Request đồng ý kết bạn
 *      responses:  
 *       200: 
 *         description: Success  
 */
router.post("/request-acceptfriend/:id", userController.sendRequestAcceptFriend);

/** 
 * @swagger 
 * /api/users/request-rejectfriend/{id}:
 *   post: 
 *      tags: [User] 
 *      summary: Request từ chối lời mời kết bạn
 *      description: Request từ chối lời mời kết bạn
 *      responses:  
 *       200: 
 *         description: Success  
 */
router.post("/request-rejectfriend/:id", userController.sendRequestRejectFriend);

module.exports = router;