# 🎉 博客项目部署完成

## 部署信息

- **服务器 IP**: 192.227.209.30
- **前端访问地址**: http://192.227.209.30:8080
- **后端 API 地址**: http://192.227.209.30:5000
- **部署日期**: 2025 年 12 月 13 日

## 服务状态

### ✅ 已安装的服务

- Node.js 20.19.6
- MongoDB 7.0.26
- Nginx 1.24.0
- PM2 (最新版)

### ✅ 运行中的服务

1. **MongoDB** - 监听 27017 端口
2. **后端 API** - PM2 管理,监听 5000 端口
3. **Nginx** - 监听 8080 端口,反向代理前后端

## 项目结构

```
/var/www/blog/
├── client/
│   ├── dist/          # 前端构建产物
│   └── src/           # 前端源代码
├── server/
│   ├── src/           # 后端源代码
│   ├── logs/          # PM2 日志
│   ├── uploads/       # 文件上传目录
│   └── .env           # 环境变量配置
└── deployment/        # 部署脚本
```

## 常用命令

### PM2 管理

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs blog-api

# 重启应用
pm2 restart blog-api

# 停止应用
pm2 stop blog-api
```

### Nginx 管理

```bash
# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 查看状态
systemctl status nginx
```

### MongoDB 管理

```bash
# 查看状态
systemctl status mongod

# 连接数据库
mongosh

# 重启数据库
systemctl restart mongod
```

## 环境配置

### 后端环境变量 (/var/www/blog/server/.env)

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=<已生成随机密钥>
CLIENT_URL=http://192.227.209.30
JWT_EXPIRES_IN=7d
```

### 前端环境变量 (/var/www/blog/client/.env)

```env
VITE_API_URL=http://192.227.209.30:5000
```

## 更新部署流程

### 方式一: 手动更新

```bash
# 1. 本地打包
cd /Users/wanglei/work/TEST/my-nodejs-blog
tar -czf /tmp/blog-update.tar.gz --exclude='node_modules' --exclude='.git' .

# 2. 上传到服务器
scp /tmp/blog-update.tar.gz blog-vps:/tmp/

# 3. 在服务器上更新
ssh blog-vps
cd /var/www/blog
tar -xzf /tmp/blog-update.tar.gz
cd server && npm install --omit=dev
cd ../client && npm install && npm run build
pm2 restart blog-api
```

### 方式二: 使用 Git (推荐后续使用)

```bash
# 1. 初始化本地 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 2. 推送到 GitHub/Gitee
# 创建远程仓库后:
git remote add origin <你的仓库地址>
git push -u origin main

# 3. 在服务器上拉取更新
ssh blog-vps
cd /var/www/blog
git pull origin main
cd server && npm install --omit=dev
cd ../client && npm install && npm run build
pm2 restart blog-api
```

## 访问测试

1. **前端页面**: http://192.227.209.30:8080
2. **健康检查**: http://192.227.209.30:5000/health
3. **API 文档**: 参考 BACKEND_GUIDE.md

## 注意事项

⚠️ **重要提醒**:

1. **80 端口被占用**: 当前服务器 80 端口被 xray 服务占用,因此使用 8080 端口访问
2. **防火墙**: 确保开放 8080 和 5000 端口
   ```bash
   ufw allow 8080
   ufw allow 5000
   ```
3. **文件权限**: uploads 目录需要写入权限
4. **数据库备份**: 定期备份 MongoDB 数据
   ```bash
   mongodump --db blog --out /backup/$(date +%Y%m%d)
   ```

## 下一步建议

1. ✅ 配置域名指向服务器
2. ✅ 使用 Let's Encrypt 配置 HTTPS
3. ✅ 设置定时数据库备份
4. ✅ 配置日志轮转
5. ✅ 添加监控告警
6. ✅ 优化前端资源加载(CDN)

## 故障排查

### 后端无法启动

```bash
# 查看日志
pm2 logs blog-api --err

# 检查 MongoDB
systemctl status mongod

# 检查端口占用
lsof -i:5000
```

### 前端访问 404

```bash
# 检查 Nginx 配置
nginx -t

# 查看 Nginx 日志
tail -f /var/log/nginx/error.log

# 检查文件权限
ls -la /var/www/blog/client/dist
```

### MongoDB 连接失败

```bash
# 检查服务状态
systemctl status mongod

# 查看 MongoDB 日志
journalctl -u mongod -f

# 测试连接
mongosh --eval "db.stats()"
```

## 联系支持

如有问题,请查看:

- 后端文档: `BACKEND_GUIDE.md`
- 服务器设置: `deployment/SERVER_SETUP.md`
- PM2 文档: https://pm2.keymetrics.io/
- Nginx 文档: https://nginx.org/en/docs/
