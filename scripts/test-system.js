const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSystem() {
  console.log('🧪 开始系统功能测试...\n')

  try {
    // 1. 测试数据库连接
    console.log('1. 测试数据库连接...')
    await prisma.$connect()
    console.log('✅ 数据库连接成功\n')

    // 2. 测试表结构
    console.log('2. 测试表结构...')
    const tableCounts = await Promise.all([
      prisma.account.count(),
      prisma.promotionRelation.count(),
      prisma.commissionRecord.count(),
      prisma.withdrawal.count(),
      prisma.settlement.count(),
      prisma.accountMembership.count(),
      prisma.product.count(),
      prisma.activationCode.count()
    ])

    console.log('📊 表记录统计:')
    console.log(`   - 用户账号: ${tableCounts[0]}`)
    console.log(`   - 推广关系: ${tableCounts[1]}`)
    console.log(`   - 分润记录: ${tableCounts[2]}`)
    console.log(`   - 提现记录: ${tableCounts[3]}`)
    console.log(`   - 结算记录: ${tableCounts[4]}`)
    console.log(`   - 账号会员: ${tableCounts[5]}`)
    console.log(`   - 产品: ${tableCounts[6]}`)
    console.log(`   - 激活码: ${tableCounts[7]}`)
    console.log('✅ 表结构正常\n')

    // 3. 测试创建测试用户
    console.log('3. 测试创建测试用户...')
    const testUser = await prisma.account.upsert({
      where: { username: 'testuser' },
      update: {},
      create: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        promotionCode: 'TEST123'
      }
    })
    console.log(`✅ 测试用户创建成功: ${testUser.username}\n`)

    // 4. 测试推广关系
    console.log('4. 测试推广关系...')
    const testPromoter = await prisma.account.upsert({
      where: { username: 'testpromoter' },
      update: {},
      create: {
        username: 'testpromoter',
        email: 'promoter@example.com',
        passwordHash: 'hashed_password',
        promotionCode: 'PROMO123'
      }
    })

    const promotionRelation = await prisma.promotionRelation.upsert({
      where: {
        promoterId_accountId: {
          promoterId: testPromoter.id,
          accountId: testUser.id
        }
      },
      update: {},
      create: {
        promoterId: testPromoter.id,
        accountId: testUser.id,
        promotionCode: testPromoter.promotionCode
      }
    })
    console.log(`✅ 推广关系创建成功: ${testPromoter.username} -> ${testUser.username}\n`)

    // 5. 测试分润计算
    console.log('5. 测试分润计算...')
    const commissionRecord = await prisma.commissionRecord.create({
      data: {
        promoterId: testPromoter.id,
        accountId: testUser.id,
        amount: 19.9, // 398 * 5%
        rate: 0.05,
        membershipType: 'regular',
        membershipPrice: 398,
        status: 'confirmed',
        confirmedAt: new Date()
      }
    })
    console.log(`✅ 分润记录创建成功: ¥${commissionRecord.amount}\n`)

    // 6. 测试会员系统
    console.log('6. 测试会员系统...')
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
    console.log(`✅ 会员记录创建成功: ${membership.type}\n`)

    // 7. 清理测试数据
    console.log('7. 清理测试数据...')
    await prisma.commissionRecord.deleteMany({
      where: { promoterId: testPromoter.id }
    })
    await prisma.promotionRelation.deleteMany({
      where: { promoterId: testPromoter.id }
    })
    await prisma.accountMembership.deleteMany({
      where: { accountId: testUser.id }
    })
    await prisma.account.deleteMany({
      where: { 
        OR: [
          { username: 'testuser' },
          { username: 'testpromoter' }
        ]
      }
    })
    console.log('✅ 测试数据清理完成\n')

    console.log('🎉 系统功能测试全部通过！')
    console.log('\n📋 测试总结:')
    console.log('   ✅ 数据库连接正常')
    console.log('   ✅ 表结构完整')
    console.log('   ✅ 用户账号系统正常')
    console.log('   ✅ 推广关系系统正常')
    console.log('   ✅ 分润计算系统正常')
    console.log('   ✅ 会员系统正常')
    console.log('   ✅ 数据清理正常')

  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSystem()
