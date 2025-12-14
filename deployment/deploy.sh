#!/bin/bash

# 部署脚本 - 在 VPS 上运行

echo "🚀 开始部署博客系统..."

# 设置变量
PROJECT_DIR="/var/www/blog"
REPO_URL="https://github.com/kk-w-git/52Ning.git"

# 进入项目目录（如果不存在则克隆）
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📦 克隆项目..."
    git clone $REPO_URL $PROJECT_DIR
fi

cd $PROJECT_DIR

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 部署后端
echo "🔧 部署后端..."
cd server
npm install --production

# 重启 PM2
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save

# 部署前端
echo "🎨 部署前端..."
cd ../client
npm install
npm run build

# 重启 Nginx
echo "🔄 重启 Nginx..."
sudo systemctl restart nginx

echo "✅ 部署完成！"
