import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// 配置环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 连接数据库
connectDB();

// 中间件
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS配置 - 允许多个来源
const allowedOrigins = [
  "http://localhost:5173",
  "https://michael-blog.top360.sbs",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // 允许没有origin的请求（比如移动应用或postman）
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 用于访问上传的图片
app.use("/uploads", express.static(join(__dirname, "../uploads")));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// 错误处理中间件
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
