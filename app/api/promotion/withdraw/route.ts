import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountSessionId } from '@/lib/account-auth'

export async function POST(request: NextRequest) {
  try {
    const accountId = await getAccountSessionId()
    if (!accountId) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, paymentMethod, paymentCode } = body

    // 验证必填字段
    if (!amount || !paymentMethod || !paymentCode) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证提现金额
    if (amount <= 0) {
      return NextResponse.json(
        { error: '提现金额必须大于0' },
        { status: 400 }
      )
    }

    // 验证支付方式
    if (!['wechat', 'alipay'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: '支付方式无效' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    })

    if (!account) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查可提现余额
    if (account.availableBalance < amount) {
      return NextResponse.json(
        { error: '可提现余额不足' },
        { status: 400 }
      )
    }

    // 检查最小提现金额
    if (amount < 10) {
      return NextResponse.json(
        { error: '最小提现金额为10元' },
        { status: 400 }
      )
    }

    // 创建提现申请
    const withdrawal = await prisma.withdrawal.create({
      data: {
        promoterId: accountId,
        amount,
        paymentMethod,
        paymentCode,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      message: '提现申请提交成功，请等待审核',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        paymentMethod: withdrawal.paymentMethod,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt
      }
    })
  } catch (error) {
    console.error('提现申请失败:', error)
    return NextResponse.json(
      { error: '提现申请失败，请稍后重试' },
      { status: 500 }
    )
  }
}
