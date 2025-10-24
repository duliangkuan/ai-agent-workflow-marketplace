const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建管理员账户
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin888888'
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.admin.upsert({
    where: { id: 'admin' },
    update: {},
    create: {
      id: 'admin',
      passwordHash: hashedPassword,
      isInitial: true
    }
  })

  console.log('管理员账户创建成功:', admin.id)

  // 创建示例产品
  const sampleProducts = [
    {
      title: '智能客服助手',
      description: '基于GPT的智能客服系统，能够自动回答常见问题，提供24/7客户服务支持。支持多语言，可自定义回复模板。',
      type: 'agent',
      purchaseCount: 15
    },
    {
      title: '内容创作工作流',
      description: '自动化内容创作流程，从主题规划到内容生成，再到SEO优化，一站式解决内容营销需求。',
      type: 'workflow',
      purchaseCount: 23
    },
    {
      title: '数据分析智能体',
      description: '智能数据分析助手，能够自动分析业务数据，生成可视化报告，提供数据洞察和建议。',
      type: 'agent',
      purchaseCount: 8
    },
    {
      title: '邮件营销自动化',
      description: '完整的邮件营销自动化工作流，包括用户分群、个性化内容生成、发送时机优化等功能。',
      type: 'workflow',
      purchaseCount: 31
    }
  ]

  for (const product of sampleProducts) {
    // Check if product already exists
    const existingProduct = await prisma.product.findFirst({
      where: { title: product.title }
    })
    
    if (!existingProduct) {
      await prisma.product.create({
        data: product
      })
    }
  }

  console.log('示例产品创建成功')

  // 生成一些示例激活码
  const activationCodes = [
    { code: 'TEMP123456789', type: 'temporary', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { code: 'REG1234567890', type: 'regular', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { code: 'PREM123456789', type: 'premium', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { code: 'SUPER12345678', type: 'super', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  ]

  for (const code of activationCodes) {
    // Check if activation code already exists
    const existingCode = await prisma.activationCode.findFirst({
      where: { code: code.code }
    })
    
    if (!existingCode) {
      await prisma.activationCode.create({
        data: code
      })
    }
  }

  console.log('示例激活码创建成功')
  console.log('数据库初始化完成！')
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
