const { SendResponse } = require("../helpers/helper");
const Post = require("../models/post.model");

const PostController = {
    createPost: async (req, res) => {
        const id = req.params.id;
        if (!req.body.title || !req.body.content) {
            return res.status(400).send(SendResponse(false, 'Title and Content are required', null))
        }
        const checkUniqueTitle = await Post.findOne({ title: req.body.title })
        if (checkUniqueTitle) {
            return res.send(SendResponse(false, 'Title already exist', null))
        }
        const slug = req.body.title.split(' ').join('-').toLowerCase().replace(/[^a-zA-Z0-9-]/g, '-')
        const newPost = new Post({
            ...req.body, slug, userId: id
        })
        try {
            const savePost = await newPost.save()
            res.status(200).send(SendResponse(true, 'Post created successfully', savePost))
        }
        catch (error) {
            res.status(500).send(SendResponse(false, error.message, null))
        }
    },
    getPosts: async (req, res) => {
        try {
            const startIndex = parseInt(req.query.startIndex) || 0
            const limit = parseInt(req.query.limit) || 9
            const sortDirection = req.query.order === 'asc' ? 1 : -1
            const query = {};

            if (req.query.userId) query.userId = req.query.userId;
            if (req.query.category) query.category = req.query.category;
            if (req.query.slug) query.slug = req.query.slug;
            if (req.query.postId) query._id = req.query.postId;

            if (req.query.searchTerm) {
                query.$or = [
                    { title: { $regex: req.query.searchTerm, $options: 'i' } },
                    { content: { $regex: req.query.searchTerm, $options: 'i' } }
                ];
            }

            const posts = await Post.find(query)
                .sort({ updatedAt: sortDirection })
                .skip(startIndex)
                .limit(limit);


            const totalPosts = await Post.countDocuments()

            const now = new Date()

            const oneMonthAgo = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate(),
            )

            const lastMonthPosts = await Post.countDocuments({
                updatedAt: {
                    $gte: oneMonthAgo
                }
            })
            res.status(200).send(SendResponse(true, null, { posts, totalPosts, lastMonthPosts }))
        }
        catch (error) {
            res.status(500).send(SendResponse(false, error.message, null))
        }
    },
    deletePost: async (req, res) => {
        try {
            const id = req.params.id;
            const deletedPost = await Post.findByIdAndDelete(id)
            res.status(200).send(SendResponse(true, "Post Deleted Successfully", deletedPost));
        }
        catch (error) {
            res.status(500).send(SendResponse(false, error.message, null))
        }
    },
    updatePost: async (req, res) => {
        try {
            const id = req.params.id
            const { title, content, category, image } = req.body
            const obj = { title, content, category, image }
            const updatedPost = await Post.findByIdAndUpdate(id, { $set: obj }, { new: true })
            res.status(200).send(SendResponse(true, 'Updated Successfully', updatedPost))
        }
        catch (error) {
            res.status(500).send(SendResponse(false, error.message, null))
        }
    },
}

module.exports = PostController;