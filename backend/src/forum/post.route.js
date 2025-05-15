const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPost, updatePost, deletePost, addComment, toggleLike } = require('./post.controller');
const verifyToken = require('../middleware/verifyToken');

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);

// Protected routes (require authentication)
router.post('/', verifyToken, createPost);
router.put('/:id', verifyToken, updatePost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/comments', verifyToken, addComment);
router.post('/:id/like', verifyToken, toggleLike);

module.exports = router; 