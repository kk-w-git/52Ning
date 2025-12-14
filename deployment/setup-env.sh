#!/bin/bash

# 在服务器上创建 .env 文件的辅助脚本

echo "🔧 创建服务器 .env 文件..."

ssh -T blog-vps << 'ENDSSH'
    cd /var/www/blog/server
    
    if [ -f .env ]; then
        echo "⚠️  .env 文件已存在，是否覆盖？(y/n)"
        read -r response
        if [[ "$response" != "y" ]]; then
            echo "❌ 已取消"
            exit 0
        fi
    fi
    
    cat > .env << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://bill88783_db_user:huxeQwTRVmfnqw9A@cluster0.23vvpbe.mongodb.net/?appName=Cluster0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS
CLIENT_URL=https://michael-blog.top360.sbs

# API URL
VITE_API_URL=https://michael-blog.top360.sbs/api
EOF
    
    echo "✅ .env 文件已创建"
    echo "📄 内容如下："
    cat .env
ENDSSH

echo ""
echo "✨ 完成！现在可以运行 ./local-deploy.sh 进行部署了"
