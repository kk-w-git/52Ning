import express from "express";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/upload
// @desc    上传单个图片
// @access  Private
router.post("/", protect, upload.single("image"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    res.json({
      message: "File uploaded successfully",
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/upload/multiple
// @desc    上传多个图片
// @access  Private
router.post(
  "/multiple",
  protect,
  upload.array("images", 5),
  (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const fileUrls = req.files.map((file) => ({
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        filename: file.filename,
      }));

      res.json({
        message: "Files uploaded successfully",
        files: fileUrls,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
