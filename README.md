# 智能体与工作流售卖平台

一个专注于智能体和工作流售卖的会员订阅制平台，支持需求定制服务。

## 功能特性

### 用户端功能
- **市场板块**：展示智能体和工作流，支持搜索、筛选、收藏
- **需求定制**：提交定制需求，自动发送邮件通知
- **个人中心**：会员订阅、激活码激活、下载管理

### 管理员后台
- **商品管理**：上架、编辑、删除智能体/工作流
- **会员码管理**：生成激活码、查看激活状态
- **密码管理**：修改管理员密码

### 会员体系
- **临时会员**：¥49.8，1天，1次下载
- **普通会员**：¥398，30天，30次下载
- **高级会员**：¥998，365天，无限下载
- **超级会员**：¥3999，永久，无限下载

## 技术栈

- **前端**：Next.js 14 + React + TypeScript
- **样式**：Tailwind CSS
- **数据库**：PostgreSQL (Vercel Postgres)
- **文件存储**：Vercel Blob
- **邮件服务**：Nodemailer + QQ邮箱SMTP
- **部署**：Vercel

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd ai-agent-workflow-marketplace
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制 `env.example` 为 `.env.local` 并配置以下环境变量：

```env
# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/ai_marketplace"

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"

# 邮件配置
EMAIL_HOST="smtp.qq.com"
EMAIL_PORT=587
EMAIL_USER="2330304961@qq.com"
EMAIL_PASS="your_email_password"
EMAIL_TO="2330304961@qq.com"

# 管理员配置
ADMIN_INITIAL_PASSWORD="admin888888"
ADMIN_ID_CARD="13062120060302271X"

# 应用配置
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="https://fengyunworkflow.top"
```

### 4. 数据库初始化
```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库模式
npm run db:push

# 初始化数据库（可选，创建示例数据）
node scripts/init-db.js
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署到 Vercel

### 1. 准备 Vercel 服务
- 创建 Vercel 项目
- 开通 Vercel Postgres 数据库
- 开通 Vercel Blob 存储服务

### 2. 配置环境变量
在 Vercel 项目设置中添加所有必要的环境变量。

### 3. 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 4. 数据库迁移
部署完成后，在 Vercel 函数中运行数据库迁移：
```bash
vercel env pull .env.local
npm run db:push
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── admin/             # 管理员后台页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── admin/            # 管理员组件
│   ├── Navigation.tsx    # 导航组件
│   ├── MarketSection.tsx # 市场板块
│   └── ...
├── lib/                  # 工具库
│   ├── prisma.ts         # 数据库连接
│   ├── auth.ts           # 认证工具
│   ├── email.ts          # 邮件服务
│   └── utils.ts          # 通用工具
├── prisma/               # 数据库模式
│   └── schema.prisma     # Prisma 模式文件
└── scripts/              # 脚本文件
    └── init-db.js        # 数据库初始化脚本
```

## API 接口

### 用户端接口
- `GET /api/products` - 获取产品列表
- `POST /api/custom-orders` - 提交定制需求
- `POST /api/activation-codes/activate` - 激活会员码
- `GET /api/memberships/user` - 获取用户会员信息
- `POST /api/favorites` - 收藏/取消收藏
- `POST /api/downloads` - 下载产品

### 管理员接口
- `POST /api/admin/login` - 管理员登录
- `GET /api/admin/products` - 获取产品列表
- `POST /api/admin/products` - 创建产品
- `PUT /api/admin/products` - 更新产品
- `DELETE /api/admin/products` - 删除产品
- `POST /api/admin/activation-codes/generate` - 生成激活码
- `GET /api/admin/activation-codes` - 获取激活码列表
- `PUT /api/admin/password` - 修改密码

## 安全特性

- 密码加密存储（bcrypt）
- 激活码唯一性校验
- 文件类型和大小限制
- SQL 注入防护（Prisma ORM）
- XSS 防护（输入转义）
- 管理员权限验证

## 开发说明

### 添加新功能
1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `npm run db:push` 更新数据库
3. 创建相应的 API 路由
4. 开发前端组件
5. 测试功能完整性

### 数据库操作
```bash
# 查看数据库
npm run db:studio

# 重置数据库
npm run db:push --force-reset

# 生成迁移文件
npm run db:migrate
```

## 许可证

MIT License

## 联系方式

- 客服电话/微信：15614325230
- 邮箱：2330304961@qq.com
