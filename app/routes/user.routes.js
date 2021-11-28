const express = require('express');
const router = express.Router();
const { authJwt } = require("../middleware/common.service");
const userController = require("../controllers/user.controller");

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
 *      description: Lấy thông tin của user theo id 
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.get("/:id", userController.getUser);

module.exports = router;