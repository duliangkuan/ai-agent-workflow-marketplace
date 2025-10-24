import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generatePromotionCode, validateEmail, validateUsername, validatePassword } from '@/lib/account-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, promotionCode } = body

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证用户名格式
    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: '用户名只能包含字母、数字、下划线，长度3-20位' },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: '请输入正确的邮箱格式' },
        { status: 400 }
      )
    }

    // 验证密码强度
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.account.findUnique({
      where: { username }
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.account.findUnique({
      where: { email }
    })
    if (existingEmail) {
      return NextResponse.json(
        { error: '邮箱已被注册' },
        { status: 400 }
      )
    }

    // 生成推广码
    const userPromotionCode = await generatePromotionCode()

    // 加密密码
    const passwordHash = await hashPassword(password)

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      // 创建用户账号
      const account = await tx.account.create({
        data: {
          username,
          email,
          passwordHash,
          promotionCode: userPromotionCode
        }
      })

      // 如果有推广码，建立推广关系
      if (promotionCode) {
        const promoter = await tx.account.findUnique({
          where: { promotionCode }
        })

        if (promoter) {
          await tx.promotionRelation.create({
            data: {
              promoterId: promoter.id,
              accountId: account.id,
              promotionCode
            }
          })

          // 更新推广员统计
          await tx.account.update({
            where: { id: promoter.id },
            data: {
              totalPromotions: { increment: 1 }
            }
          })
        }
      }

      return account
    })

    return NextResponse.json({
      success: true,
      message: '注册成功！',
      account: {
        id: result.id,
        username: result.username,
        email: result.email,
        promotionCode: result.promotionCode
      }
    })
  } catch (error) {
    console.error('用户注册失败:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
