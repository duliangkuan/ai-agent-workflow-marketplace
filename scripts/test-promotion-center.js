const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPromotionCenter() {
  console.log('🧪 测试推广中心功能...\n')

  try {
    // 1. 创建测试推广员
    console.log('1. 创建测试推广员...')
    const promoter = await prisma.account.upsert({
      where: { username: 'testpromoter' },
      update: {},
      create: {
        username: 'testpromoter',
        email: 'promoter@example.com',
        passwordHash: 'hashed_password',
        promotionCode: 'PROMO123',
        totalEarnings: 100.0,
        availableBalance: 50.0,
        totalPromotions: 2
      }
    })
    console.log(`✅ 推广员创建成功: ${promoter.username}`)
    console.log(`   推广码: ${promoter.promotionCode}`)
    console.log(`   总收益: ¥${promoter.totalEarnings}`)
    console.log(`   可提现: ¥${promoter.availableBalance}`)
    console.log('')

    // 2. 创建测试推广用户
    console.log('2. 创建测试推广用户...')
    const promotedUser = await prisma.account.upsert({
      where: { username: 'promoteduser' },
      update: {},
      create: {
        username: 'promoteduser',
        email: 'promoted@example.com',
        passwordHash: 'hashed_password',
        promotionCode: 'PROMOTED123'
      }
    })
    console.log(`✅ 推广用户创建成功: ${promotedUser.username}`)
    console.log('')

    // 3. 建立推广关系
    console.log('3. 建立推广关系...')
    const promotionRelation = await prisma.promotionRelation.upsert({
      where: {
        promoterId_accountId: {
          promoterId: promoter.id,
          accountId: promotedUser.id
        }
      },
      update: {},
      create: {
        promoterId: promoter.id,
        accountId: promotedUser.id,
        promotionCode: promoter.promotionCode,
        totalPurchaseAmount: 398.0,
        totalCommission: 19.9
      }
    })
    console.log(`✅ 推广关系建立成功`)
    console.log(`   推广员: ${promoter.username}`)
    console.log(`   推广用户: ${promotedUser.username}`)
    console.log(`   总购买金额: ¥${promotionRelation.totalPurchaseAmount}`)
    console.log(`   总分润: ¥${promotionRelation.totalCommission}`)
    console.log('')

    // 4. 创建分润记录
    console.log('4. 创建分润记录...')
    const commissionRecord = await prisma.commissionRecord.create({
      data: {
        promoterId: promoter.id,
        accountId: promotedUser.id,
        amount: 19.9,
        rate: 0.05,
        membershipType: 'regular',
        membershipPrice: 398.0,
        status: 'confirmed',
        confirmedAt: new Date()
      }
    })
    console.log(`✅ 分润记录创建成功`)
    console.log(`   分润金额: ¥${commissionRecord.amount}`)
    console.log(`   分润比例: ${(commissionRecord.rate * 100).toFixed(0)}%`)
    console.log(`   会员类型: ${commissionRecord.membershipType}`)
    console.log('')

    // 5. 测试API调用
    console.log('5. 测试推广中心API...')
    console.log('   请访问: http://localhost:3000')
    console.log('   登录账号: testpromoter')
    console.log('   密码: 任意密码（测试环境）')
    console.log('   然后点击"推广中心"标签页')
    console.log('')

    // 6. 显示测试数据总结
    console.log('📊 测试数据总结:')
    console.log(`   推广员: ${promoter.username} (${promoter.promotionCode})`)
    console.log(`   推广用户: ${promotedUser.username}`)
    console.log(`   推广关系: 1个`)
    console.log(`   分润记录: 1条`)
    console.log(`   总收益: ¥${promoter.totalEarnings}`)
    console.log(`   可提现: ¥${promoter.availableBalance}`)
    console.log('')

    console.log('🎉 推广中心测试数据创建完成！')
    console.log('\n💡 使用说明:')
    console.log('   1. 访问 http://localhost:3000')
    console.log('   2. 点击"推广中心"标签页')
    console.log('   3. 如果未登录，会显示注册/登录界面')
    console.log('   4. 登录后可以看到推广数据和统计信息')

  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPromotionCenter()
