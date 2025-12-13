import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/users/:id
// @desc    获取用户信息
// @access  Public
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 获取用户的文章数量
    const postCount = await Post.countDocuments({
      author: user._id,
      published: true,
    });

    res.json({
      ...user.toObject(),
      postCount,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    更新用户资料
// @access  Private
router.put("/profile", protect, async (req, res, next) => {
  try {
    const { username, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id/posts
// @desc    获取用户的所有文章
// @access  Public
router.get("/:id/posts", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: req.params.id, published: true })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({
      author: req.params.id,
      published: true,
    });

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

export default router;
