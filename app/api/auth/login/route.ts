import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createAccountSession } from '@/lib/account-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { login, password } = body // login可以是用户名或邮箱

    if (!login || !password) {
      return NextResponse.json(
        { error: '请输入用户名/邮箱和密码' },
        { status: 400 }
      )
    }

    // 查找用户（支持用户名或邮箱登录）
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { username: login },
          { email: login }
        ]
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: '用户名/邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 验证密码
    const isValid = await verifyPassword(password, account.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: '用户名/邮箱或密码错误' },
        { status: 401 }
      )
    }

    // 检查账号状态
    if (account.status !== 'active') {
      return NextResponse.json(
        { error: '账号已被禁用' },
        { status: 401 }
      )
    }

    // 创建安全会话
    const sessionToken = await createAccountSession(account.id)

    // 更新最后登录时间
    await prisma.account.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: '登录成功',
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        promotionCode: account.promotionCode,
        totalEarnings: account.totalEarnings,
        availableBalance: account.availableBalance,
        totalPromotions: account.totalPromotions
      }
    })
  } catch (error) {
    console.error('用户登录失败:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
