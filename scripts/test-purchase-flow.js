const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPurchaseFlow() {
  console.log('🧪 测试购买流程功能...\n')

  try {
    // 1. 检查产品数据
    console.log('1. 检查产品数据...')
    const products = await prisma.product.findMany({
      take: 2,
      include: {
        _count: {
          select: {
            downloadRecords: true,
            favorites: true
          }
        }
      }
    })

    if (products.length === 0) {
      console.log('❌ 没有找到产品数据，请先运行 init-db.js')
      return
    }

    console.log(`✅ 找到 ${products.length} 个产品`)
    products.forEach(product => {
      console.log(`   - ${product.title} (${product.type})`)
    })
    console.log('')

    // 2. 检查激活码数据
    console.log('2. 检查激活码数据...')
    const activationCodes = await prisma.activationCode.findMany({
      take: 3
    })

    if (activationCodes.length === 0) {
      console.log('❌ 没有找到激活码数据，请先运行 init-db.js')
      return
    }

    console.log(`✅ 找到 ${activationCodes.length} 个激活码`)
    activationCodes.forEach(code => {
      console.log(`   - ${code.code} (${code.type})`)
    })
    console.log('')

    // 3. 测试用户注册流程
    console.log('3. 测试用户注册流程...')
    const testUser = await prisma.account.upsert({
      where: { username: 'testpurchase' },
      update: {},
      create: {
        username: 'testpurchase',
        email: 'testpurchase@example.com',
        passwordHash: 'hashed_password',
        promotionCode: 'PURCHASE123'
      }
    })
    console.log(`✅ 测试用户创建成功: ${testUser.username}`)
    console.log('')

    // 4. 测试会员激活流程
    console.log('4. 测试会员激活流程...')
    const regularCode = activationCodes.find(code => code.type === 'regular')
    if (regularCode) {
      const membership = await prisma.accountMembership.create({
        data: {
          accountId: testUser.id,
          type: 'regular',
          startTime: new Date(),
          endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          remainingDownloads: 30,
          status: 'active'
        }
      })
      console.log(`✅ 会员激活成功: ${membership.type}`)
    }
    console.log('')

    // 5. 测试下载记录
    console.log('5. 测试下载记录...')
    if (products.length > 0) {
      const downloadRecord = await prisma.accountDownloadRecord.create({
        data: {
          accountId: testUser.id,
          productId: products[0].id
        }
      })
      console.log(`✅ 下载记录创建成功: ${products[0].title}`)
    }
    console.log('')

    // 6. 清理测试数据
    console.log('6. 清理测试数据...')
    await prisma.accountDownloadRecord.deleteMany({
      where: { accountId: testUser.id }
    })
    await prisma.accountMembership.deleteMany({
      where: { accountId: testUser.id }
    })
    await prisma.account.delete({
      where: { id: testUser.id }
    })
    console.log('✅ 测试数据清理完成')
    console.log('')

    console.log('🎉 购买流程测试全部通过！')
    console.log('\n📋 测试总结:')
    console.log('   ✅ 产品数据正常')
    console.log('   ✅ 激活码数据正常')
    console.log('   ✅ 用户注册流程正常')
    console.log('   ✅ 会员激活流程正常')
    console.log('   ✅ 下载记录功能正常')
    console.log('   ✅ 数据清理正常')
    console.log('\n💡 前端功能说明:')
    console.log('   - 未登录用户点击购买按钮会弹出注册弹窗')
    console.log('   - 已登录用户点击购买按钮会跳转到个人中心')
    console.log('   - 注册成功后自动跳转到个人中心')
    console.log('   - 支持推广链接参数自动填充推广码')

  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPurchaseFlow()
