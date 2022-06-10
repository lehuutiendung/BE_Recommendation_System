const express = require('express');
const router = express.Router();
const recommendController = require("../controllers/recommend.controller");

router.post("/recommend-post", recommendController.recommendPost);

module.exports = router;
