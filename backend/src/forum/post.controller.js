const Post = require('./post.model');

// Create a new post
const createPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const post = new Post({
            title,
            content,
            category,
            tags,
            author: req.user.id
        });
        await post.save();
        await post.populate('author', 'username');
        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
};

// Get all posts with pagination and filters
const getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag, search } = req.query;
        const query = {};

        if (category) {
            query.category = category;
        }
        if (tag) {
            query.tags = tag;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await Post.find(query)
            .populate('author', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Post.countDocuments(query);

        res.status(200).json({
            posts,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ message: 'Failed to get posts' });
    }
};

// Get a single post by ID
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.author', 'username');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        res.status(200).json(post);
    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({ message: 'Failed to get post' });
    }
};

// Update a post
const updatePost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        post.title = title;
        post.content = content;
        post.category = category;
        post.tags = tags;

        await post.save();
        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Failed to update post' });
    }
};

// Delete a post
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author or admin
        if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post' });
    }
};

// Add a comment
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            content,
            author: req.user.id
        });

        await post.save();
        await post.populate('comments.author', 'username');
        
        res.status(201).json(post.comments[post.comments.length - 1]);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

// Like/Unlike a post
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const index = post.likes.indexOf(req.user.id);
        if (index === -1) {
            post.likes.push(req.user.id);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.status(200).json({ likes: post.likes.length });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Failed to toggle like' });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    addComment,
    toggleLike
}; 