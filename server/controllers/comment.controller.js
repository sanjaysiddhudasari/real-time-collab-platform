const Comment = require('../models/comment.model');

const createComment = async (req, res) => {
    try {
        const { roomId, fileId, line, type, explanation, suggestion, isAI } = req.body;
        if (!roomId || !fileId || !line || !type || !explanation) {
            return res.status(400).json({ message: 'roomId, fileId, line, type and explanation are required' });
        }
        const comment = await Comment.create({
            roomId,
            fileId,
            line,
            type,
            explanation,
            suggestion,
            isAI: !!isAI,
            author: isAI ? undefined : req.userId,
        });
        await comment.populate({ path: 'author', select: 'username' });
        req.app.get("io")?.to(roomId).emit("comment-updated", { fileId, line });
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error in createComment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const POPULATE = [
    { path: 'author', select: 'username' },
    { path: 'replies.author', select: 'username' },
];

const getCommentsByRoomAndFile = async (req, res) => {
    try {
        const { roomId, fileId } = req.params;
        const comments = await Comment.find({ roomId, fileId }).populate(POPULATE).sort({ line: 1, createdAt: 1 });
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error in getCommentsByRoomAndFile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const replyToComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { explanation } = req.body;
        if (!explanation) {
            return res.status(400).json({ message: 'explanation is required' });
        }
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.replies.push({ explanation, author: req.userId });
        await comment.save();
        await comment.populate(POPULATE);
        req.app.get("io")?.to(comment.roomId).emit("comment-updated", { fileId: comment.fileId, line: comment.line });
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error in replyToComment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const setResolved = async (req, res, isResolved) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.isResolved = isResolved;
        await comment.save();
        await comment.populate(POPULATE);
        req.app.get("io")?.to(comment.roomId).emit("comment-updated", { fileId: comment.fileId, line: comment.line });
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error in setResolved:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const resolveComment = (req, res) => setResolved(req, res, true);
const unresolveComment = (req, res) => setResolved(req, res, false);

module.exports = { createComment, getCommentsByRoomAndFile, replyToComment, resolveComment, unresolveComment };
