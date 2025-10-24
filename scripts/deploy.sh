#!/bin/bash

echo "🚀 开始部署智能体与工作流售卖平台..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ 未安装 Vercel CLI，正在安装..."
    npm install -g vercel
fi

# 检查环境变量文件
if [ ! -f ".env.local" ]; then
    echo "❌ 未找到 .env.local 文件，请先配置环境变量"
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ 部署成功！"
    echo "📝 请确保在 Vercel 控制台中配置了所有必要的环境变量"
    echo "🗄️ 请运行数据库迁移：npm run db:push"
else
    echo "❌ 部署失败"
    exit 1
fi
