# VPS 服务器初始化指南

## 1. 服务器基础配置

### 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

### 安装必要软件
```bash
# Node.js (使用 NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# MongoDB
# 参考官方文档: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/

# Nginx
sudo apt install -y nginx

# PM2
sudo npm install -g pm2

# Git
sudo apt install -y git
```

## 2. MongoDB 配置

### 启动 MongoDB
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 创建数据库用户（可选，推荐）
```bash
mongosh
use admin
db.createUser({
  user: "blogadmin",
  pwd: "your-strong-password",
  roles: ["readWriteAnyDatabase"]
})
```

## 3. 防火墙配置

```bash
# 允许 SSH
sudo ufw allow 22

# 允许 HTTP 和 HTTPS
sudo ufw allow 80
sudo ufw allow 443

# 启用防火墙
sudo ufw enable
```

## 4. 配置 Nginx

```bash
# 复制配置文件
sudo cp deployment/nginx.conf /etc/nginx/sites-available/blog

# 创建软链接
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 5. SSL 证书配置（使用 Let's Encrypt）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 6. 部署应用

```bash
# 克隆项目
git clone your-repo-url /var/www/blog
cd /var/www/blog

# 后端
cd server
npm install --production
cp .env.example .env
# 编辑 .env 文件配置生产环境变量
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # 设置开机自启

# 前端
cd ../client
npm install
npm run build
```

## 7. 日常维护

### 查看应用日志
```bash
pm2 logs blog-api
```

### 重启应用
```bash
pm2 restart blog-api
```

### 监控应用
```bash
pm2 monit
```

### 备份数据库
```bash
mongodump --db blog --out /backup/$(date +%Y%m%d)
```

## 8. 安全建议

1. 定期更新系统和软件包
2. 使用强密码
3. 配置 SSH 密钥登录，禁用密码登录
4. 定期备份数据
5. 监控服务器资源使用情况
6. 使用环境变量存储敏感信息
7. 启用 MongoDB 认证
8. 配置 fail2ban 防止暴力破解
