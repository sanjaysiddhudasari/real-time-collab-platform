const express = require('express');
const { createComment,getCommentsByRoomAndFile,replyToComment,resolveComment,unresolveComment } = require('../controllers/comment.controller');
const protectRoute = require('../middlewares/protectRoute');

const router = express.Router();

router.post('/', protectRoute, createComment);
router.get('/:roomId/:fileId', protectRoute, getCommentsByRoomAndFile);
router.post('/:id/reply',protectRoute, replyToComment);
router.patch('/:id/resolve',protectRoute, resolveComment);
router.patch('/:id/unresolve',protectRoute, unresolveComment);

module.exports = router;
