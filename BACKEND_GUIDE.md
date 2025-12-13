# 后端开发指南

本指南将帮助你理解和扩展后端功能。前端部分已经完成，你可以专注于学习服务端开发。

## 🎯 学习目标

通过这个项目，你将学习：
- Express 框架和 RESTful API 设计
- MongoDB 数据库操作
- JWT 身份认证
- 文件上传处理
- 中间件的使用
- 错误处理
- 安全性最佳实践

## 📖 代码结构说明

### 入口文件 (src/index.js)

这是应用的主入口，负责：
- 加载环境变量
- 连接数据库
- 配置中间件
- 注册路由
- 启动服务器

### 数据模型 (src/models/)

**User.js** - 用户模型
```javascript
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password: 加密后的密码
- avatar: 头像 URL
- bio: 个人简介
- role: 用户角色（user/admin）
```

**Post.js** - 文章模型
```javascript
- title: 标题
- content: 内容（HTML）
- excerpt: 摘要
- coverImage: 封面图片
- author: 作者（关联到 User）
- tags: 标签数组
- category: 分类
- published: 是否发布
- views: 浏览量
- likes: 点赞用户数组
- comments: 评论数组
```

### 路由 (src/routes/)

#### auth.routes.js - 认证相关
- `POST /register` - 注册新用户
- `POST /login` - 用户登录
- `GET /me` - 获取当前用户信息

#### post.routes.js - 文章相关
- `GET /` - 获取文章列表（支持分页、搜索、筛选）
- `GET /:id` - 获取单篇文章
- `POST /` - 创建文章
- `PUT /:id` - 更新文章
- `DELETE /:id` - 删除文章
- `POST /:id/like` - 点赞/取消点赞
- `POST /:id/comments` - 添加评论
- `DELETE /:id/comments/:commentId` - 删除评论

#### user.routes.js - 用户相关
- `GET /:id` - 获取用户信息
- `PUT /profile` - 更新个人资料
- `GET /:id/posts` - 获取用户的文章

#### upload.routes.js - 文件上传
- `POST /` - 上传单个图片
- `POST /multiple` - 上传多个图片

### 中间件 (src/middleware/)

#### auth.js - 认证中间件
- `protect`: 验证 JWT token，保护需要登录的路由
- `admin`: 验证管理员权限

#### errorHandler.js - 错误处理
统一处理各种错误（验证错误、数据库错误、JWT 错误等）

#### upload.js - 文件上传
配置 Multer，处理文件上传、验证和存储

## 🔧 如何扩展功能

### 示例 1：添加文章收藏功能

1. **修改 Post 模型** (src/models/Post.js)
```javascript
favorites: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]
```

2. **添加路由** (src/routes/post.routes.js)
```javascript
router.post('/:id/favorite', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const favoriteIndex = post.favorites.indexOf(req.user._id);
    if (favoriteIndex > -1) {
      post.favorites.splice(favoriteIndex, 1); // 取消收藏
    } else {
      post.favorites.push(req.user._id); // 添加收藏
    }

    await post.save();
    res.json({ 
      favorites: post.favorites.length, 
      isFavorited: favoriteIndex === -1 
    });
  } catch (error) {
    next(error);
  }
});
```

### 示例 2：添加文章草稿功能

1. **修改 Post 模型**
```javascript
status: {
  type: String,
  enum: ['draft', 'published'],
  default: 'draft'
}
```

2. **修改获取文章列表的逻辑**
```javascript
// 只显示已发布的文章（公开接口）
let query = { status: 'published' };

// 或者显示所有自己的文章（包括草稿）
if (req.user) {
  query = { 
    $or: [
      { status: 'published' },
      { author: req.user._id }
    ]
  };
}
```

### 示例 3：添加关注功能

1. **修改 User 模型**
```javascript
following: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}],
followers: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
}]
```

2. **添加路由**
```javascript
// src/routes/user.routes.js
router.post('/:id/follow', protect, async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // 取消关注
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // 关注
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ isFollowing: !isFollowing });
  } catch (error) {
    next(error);
  }
});
```

## 🔍 常见问题

### Q: 如何添加数据验证？
A: 可以使用 express-validator：
```javascript
import { body, validationResult } from 'express-validator';

router.post('/posts',
  protect,
  [
    body('title').trim().isLength({ min: 1, max: 100 }),
    body('content').trim().isLength({ min: 1 })
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // 处理请求...
  }
);
```

### Q: 如何实现 API 限流？
A: 使用 express-rate-limit（已安装）：
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 限制 100 个请求
});

app.use('/api/', limiter);
```

### Q: 如何添加日志记录？
A: 可以使用 winston 或 morgan：
```javascript
import morgan from 'morgan';

// 开发环境
app.use(morgan('dev'));

// 生产环境
app.use(morgan('combined'));
```

### Q: 如何优化数据库查询？
A: 
1. 使用索引
2. 只选择需要的字段：`.select('title author')`
3. 使用 lean()：`.lean()` 返回普通 JS 对象
4. 分页查询避免一次加载过多数据

### Q: 如何处理文件删除？
A: 当删除文章或更换图片时，应该同时删除旧文件：
```javascript
import fs from 'fs/promises';
import path from 'path';

async function deleteFile(filename) {
  const filePath = path.join(__dirname, '../uploads', filename);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
}
```

## 🛡️ 安全性建议

1. **永远不要在响应中返回密码**
   - 模型中设置 `select: false`
   - 或在查询后手动删除：`delete user._doc.password`

2. **验证用户输入**
   - 使用 express-validator
   - 清理 HTML 内容防止 XSS

3. **使用 helmet 保护 HTTP 头**
   - 已在项目中配置

4. **限制文件上传大小**
   - 已在 multer 配置中设置

5. **使用环境变量存储敏感信息**
   - JWT_SECRET
   - 数据库连接字符串

6. **实现 CORS 白名单**
   ```javascript
   const whitelist = ['http://localhost:5173', 'https://your-domain.com'];
   app.use(cors({
     origin: function (origin, callback) {
       if (whitelist.indexOf(origin) !== -1 || !origin) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     }
   }));
   ```

## 📚 推荐学习资源

- [Express 官方文档](https://expressjs.com/)
- [Mongoose 官方文档](https://mongoosejs.com/)
- [MDN Web Docs - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)

## 💡 下一步学习建议

1. 实现示例中的新功能
2. 添加单元测试（使用 Jest）
3. 实现 WebSocket 实时通知
4. 集成 Redis 缓存
5. 实现全文搜索（Elasticsearch）
6. 添加 GraphQL API
7. 实现微服务架构

祝你学习愉快！如有问题，随时查看代码注释或搜索相关文档。
