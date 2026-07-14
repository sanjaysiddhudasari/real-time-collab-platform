const express = require('express');
const { createComment } = require('../controllers/comment.controller');
const protectRoute = require('../middlewares/protectRoute');

const router = express.Router();

router.post('/', protectRoute, createComment);

module.exports = router;
