const fs = require('fs')
const path = require('path')

console.log('🧪 测试项目设置...')

// 检查必要的文件是否存在
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'prisma/schema.prisma',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'lib/prisma.ts',
  'lib/auth.ts',
  'lib/email.ts',
  'lib/utils.ts'
]

const missingFiles = []

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file)
  }
})

if (missingFiles.length > 0) {
  console.log('❌ 缺少以下文件:')
  missingFiles.forEach(file => console.log(`   - ${file}`))
  process.exit(1)
}

// 检查 package.json 中的依赖
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredDeps = [
  'next',
  'react',
  'react-dom',
  '@prisma/client',
  'prisma',
  'tailwindcss',
  'typescript',
  'bcryptjs',
  'nodemailer',
  '@vercel/blob'
]

const missingDeps = requiredDeps.filter(dep => 
  !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
)

if (missingDeps.length > 0) {
  console.log('❌ 缺少以下依赖:')
  missingDeps.forEach(dep => console.log(`   - ${dep}`))
  process.exit(1)
}

// 检查环境变量示例文件
if (!fs.existsSync('env.example')) {
  console.log('❌ 缺少 env.example 文件')
  process.exit(1)
}

console.log('✅ 项目设置检查通过！')
console.log('📝 下一步:')
console.log('   1. 复制 env.example 为 .env.local')
console.log('   2. 配置环境变量')
console.log('   3. 运行 npm install')
console.log('   4. 运行 npm run db:push')
console.log('   5. 运行 npm run dev')
