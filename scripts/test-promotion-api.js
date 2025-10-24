const fetch = require('node-fetch')

async function testPromotionAPI() {
  console.log('🧪 测试推广中心API...\n')

  try {
    // 1. 测试登录API
    console.log('1. 测试登录API...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: 'testpromoter',
        password: 'testpassword'
      }),
    })

    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ 登录API正常')
      console.log(`   响应: ${loginData.success ? '成功' : '失败'}`)
      if (loginData.success) {
        console.log(`   用户: ${loginData.account.username}`)
        console.log(`   推广码: ${loginData.account.promotionCode}`)
      }
    } else {
      console.log('❌ 登录API失败')
      console.log(`   状态码: ${loginResponse.status}`)
    }
    console.log('')

    // 2. 测试推广信息API
    console.log('2. 测试推广信息API...')
    const promotionResponse = await fetch('http://localhost:3000/api/promotion/me', {
      method: 'GET',
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || ''
      }
    })

    if (promotionResponse.ok) {
      const promotionData = await promotionResponse.json()
      console.log('✅ 推广信息API正常')
      console.log(`   响应: ${promotionData.success ? '成功' : '失败'}`)
      if (promotionData.success) {
        console.log(`   推广员: ${promotionData.data.account.username}`)
        console.log(`   总收益: ¥${promotionData.data.account.totalEarnings}`)
        console.log(`   可提现: ¥${promotionData.data.account.availableBalance}`)
        console.log(`   推广人数: ${promotionData.data.account.totalPromotions}`)
        console.log(`   推广链接: ${promotionData.data.promotionLink}`)
        console.log(`   下次结算: ${promotionData.data.nextSettlementDate}`)
      }
    } else {
      console.log('❌ 推广信息API失败')
      console.log(`   状态码: ${promotionResponse.status}`)
      const errorText = await promotionResponse.text()
      console.log(`   错误信息: ${errorText}`)
    }
    console.log('')

    console.log('🎉 API测试完成！')
    console.log('\n💡 如果API正常，推广中心应该能正常显示数据')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.log('\n💡 请确保开发服务器正在运行: npm run dev')
  }
}

testPromotionAPI()
