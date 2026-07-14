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
        res.status(201).json(comment);
    } catch (error) {
        console.error('Error in createComment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createComment };
