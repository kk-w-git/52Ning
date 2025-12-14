#!/bin/bash

# 本地部署脚本 - 在本地运行，自动部署到远程服务器

# 配置项 - 请根据实际情况修改
SERVER_HOST="blog-vps"  # SSH配置别名或服务器地址
SERVER_PATH="/var/www/blog"  # 服务器上的项目路径
BRANCH="main"  # 要部署的分支

echo "🚀 开始从本地部署到服务器..."

# 1. 确认本地代码已提交并推送
echo "📦 检查本地Git状态..."
if [[ -n $(git status -s) ]]; then
    echo "⚠️  检测到未提交的更改，是否继续？(y/n)"
    read -r response
    if [[ "$response" != "y" ]]; then
        echo "❌ 部署已取消"
        exit 1
    fi
fi

# 2. 推送代码到GitHub
echo "📤 推送代码到GitHub..."
git push origin $BRANCH

if [ $? -ne 0 ]; then
    echo "❌ 推送失败，请检查网络或Git配置"
    exit 1
fi

echo "✅ 代码已推送到GitHub"

# 3. 通过SSH在服务器上执行部署
echo "🔄 连接到服务器并执行部署..."
ssh -T ${SERVER_HOST} << 'ENDSSH'
    set -e
    
    # 检查项目目录是否存在
    if [ ! -d /var/www/blog ]; then
        echo "📦 项目目录不存在，开始克隆仓库..."
        sudo mkdir -p /var/www/blog
        sudo chown -R $USER:$USER /var/www/blog
        cd /var/www
        git clone https://github.com/kk-w-git/52Ning.git blog
        echo "✅ 仓库克隆完成"
    fi
    
    echo "📥 切换到项目目录..."
    cd /var/www/blog
    
    # 检查是否是git仓库
    if [ ! -d .git ]; then
        echo "⚠️  目录存在但不是Git仓库，重新初始化..."
        cd /var/www
        sudo rm -rf blog
        sudo mkdir -p blog
        sudo chown -R $USER:$USER blog
        git clone https://github.com/kk-w-git/52Ning.git blog
        cd blog
    fi
    
    echo "📥 拉取最新代码..."
    git pull origin main
    
    echo "🔧 部署后端..."
    cd server
    
    # 检查 .env 文件
    if [ ! -f .env ]; then
        echo "⚠️  警告: .env 文件不存在，请手动创建"
        exit 1
    fi
    
    npm install --production
    
    echo "🔄 重启 PM2..."
    pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
    pm2 save
    
    echo "🎨 部署前端..."
    cd ../client
    npm install
    npm run build
    
    echo "🔄 重启 Nginx..."
    sudo systemctl restart nginx
    
    echo "✅ 服务器部署完成！"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "✨ 部署成功！"
    echo "🌐 访问: https://michael-blog.top360.sbs"
    echo ""
    echo "📊 查看日志: ssh ${SERVER_HOST} 'pm2 logs blog-backend'"
else
    echo "❌ 部署失败，请检查服务器日志"
    exit 1
fi
