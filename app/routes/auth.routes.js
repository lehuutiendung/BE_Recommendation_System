/**
 * Authentication
 */
const express = require('express');
const router = express.Router();
const { verifySignUp } = require("../middleware/common.service");
const controller = require("../controllers/auth.controller");

/** 
 * @swagger 
 * /api/auth/sign-up: 
 *   post: 
 *      tags: [Authen] 
 *      summary: Đăng ký
 *      description: Sign up 
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post(
  "/sign-up",
  [
    verifySignUp.checkDuplicateEmail,
    verifySignUp.checkRolesExisted
  ],
  controller.signUp
);

/** 
 * @swagger 
 * /api/auth/sign-in: 
 *   post: 
 *      tags: [Authen] 
 *      summary: Đăng nhập
 *      description: Sign in 
 *      responses:  
 *       201: 
 *         description: Success  
 */
router.post("/sign-in", controller.signIn);

module.exports = router;