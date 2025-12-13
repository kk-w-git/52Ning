import express from "express";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/posts
// @desc    获取文章列表（支持分页、搜索、筛选）
// @access  Public
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, category, author } = req.query;

    // 构建查询条件
    let query = { published: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    const posts = await Post.find(query)
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/posts/:id
// @desc    获取单篇文章详情
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username avatar bio")
      .populate("comments.user", "username avatar");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 增加浏览量
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/posts
// @desc    创建新文章
// @access  Private
router.post("/", protect, async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, tags, category } = req.body;

    const post = await Post.create({
      title,
      content,
      excerpt,
      coverImage,
      tags,
      category,
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "username avatar"
    );

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/posts/:id
// @desc    更新文章
// @access  Private
router.put("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 检查是否是文章作者
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });
    }

    const { title, content, excerpt, coverImage, tags, category, published } =
      req.body;

    post.title = title || post.title;
    post.content = content || post.content;
    post.excerpt = excerpt || post.excerpt;
    post.coverImage = coverImage || post.coverImage;
    post.tags = tags || post.tags;
    post.category = category || post.category;
    if (published !== undefined) post.published = published;

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate(
      "author",
      "username avatar"
    );

    res.json(populatedPost);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/posts/:id
// @desc    删除文章
// @access  Private
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 检查是否是文章作者
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/posts/:id/like
// @desc    点赞/取消点赞文章
// @access  Private
router.post("/:id/like", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex > -1) {
      // 已点赞，取消点赞
      post.likes.splice(likeIndex, 1);
    } else {
      // 未点赞，添加点赞
      post.likes.push(req.user._id);
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/posts/:id/comments
// @desc    添加评论
// @access  Private
router.post("/:id/comments", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const { content } = req.body;

    post.comments.push({
      user: req.user._id,
      content,
    });

    await post.save();
    const updatedPost = await Post.findById(post._id).populate(
      "comments.user",
      "username avatar"
    );

    res.status(201).json(updatedPost.comments);
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/posts/:id/comments/:commentId
// @desc    删除评论
// @access  Private
router.delete("/:id/comments/:commentId", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 检查是否是评论作者
    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    comment.deleteOne();
    await post.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
