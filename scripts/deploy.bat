@echo off
echo 🚀 开始部署智能体与工作流售卖平台...

REM 检查是否安装了 Vercel CLI
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未安装 Vercel CLI，正在安装...
    npm install -g vercel
)

REM 检查环境变量文件
if not exist ".env.local" (
    echo ❌ 未找到 .env.local 文件，请先配置环境变量
    pause
    exit /b 1
)

REM 构建项目
echo 📦 构建项目...
npm run build

if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

REM 部署到 Vercel
echo 🌐 部署到 Vercel...
vercel --prod

if %errorlevel% eq 0 (
    echo ✅ 部署成功！
    echo 📝 请确保在 Vercel 控制台中配置了所有必要的环境变量
    echo 🗄️ 请运行数据库迁移：npm run db:push
) else (
    echo ❌ 部署失败
    pause
    exit /b 1
)

pause
