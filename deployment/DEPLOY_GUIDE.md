# 快速部署指南

## 部署步骤

### 1. 首次部署

如果是首次部署到服务器，需要先手动创建 `.env` 文件：

```bash
# SSH 连接到服务器
ssh your-username@your-server-ip

# 创建项目目录
sudo mkdir -p /var/www/blog
sudo chown -R $USER:$USER /var/www/blog

# 克隆项目（如果还没有）
cd /var/www
git clone https://github.com/kk-w-git/52Ning.git blog

# 创建并配置 .env 文件
cd blog/server
cp .env.example .env
nano .env  # 或使用 vim 编辑
```

编辑 `.env` 文件，设置正确的值：

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://bill88783_db_user:huxeQwTRVmfnqw9A@cluster0.23vvpbe.mongodb.net/?appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
CLIENT_URL=https://michael-blog.top360.sbs
VITE_API_URL=https://michael-blog.top360.sbs/api
```

### 2. 使用 deploy.sh 部署

在服务器上执行：

```bash
cd /var/www/blog/deployment
chmod +x deploy.sh
./deploy.sh
```

或者从本地通过 SSH 执行：

```bash
ssh your-username@your-server-ip "cd /var/www/blog/deployment && ./deploy.sh"
```

### 3. 验证部署

```bash
# 查看 PM2 状态
pm2 list

# 查看后端日志
pm2 logs blog-backend

# 查看 Nginx 状态
sudo systemctl status nginx

# 测试 API
curl https://michael-blog.top360.sbs/api/posts
```

## 注意事项

1. **环境变量**：`.env` 文件不会被 Git 追踪，首次部署后需要手动创建
2. **CORS 配置**：当前配置允许 localhost:5173（本地开发）和生产域名访问
3. **数据库连接**：确保 MongoDB URI 正确且网络可访问
4. **文件权限**：确保 uploads 目录有写入权限：`chmod 755 /var/www/blog/server/uploads`
5. **Nginx 配置**：确保 nginx.conf 已正确配置并软链接到 `/etc/nginx/sites-enabled/`

## 常见问题

### Q: 部署后提示 .env 文件不存在？

A: 手动创建 `.env` 文件，参考 `.env.example`

### Q: CORS 错误？

A: 检查 `.env` 中的 `CLIENT_URL` 是否设置为生产域名

### Q: PM2 重启失败？

A: 运行 `pm2 logs blog-backend` 查看错误日志

### Q: 如何更新 .env 配置？

A: SSH 到服务器，编辑 `/var/www/blog/server/.env`，然后运行 `pm2 restart blog-backend`

## 自动化部署（可选）

可以设置 GitHub Actions 自动部署，或使用 webhook 监听 push 事件自动执行 deploy.sh。
