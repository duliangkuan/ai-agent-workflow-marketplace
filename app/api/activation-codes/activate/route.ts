import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'
import { getAccountSessionId } from '@/lib/account-auth'
import { getMembershipTypeInfo } from '@/lib/utils'
import { processCommission } from '@/lib/commission'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: '请输入激活码' },
        { status: 400 }
      )
    }

    // 优先使用账号系统，回退到会话系统
    const accountSessionToken = await getAccountSessionId()
    const sessionUserId = await getUserId()
    
    if (!accountSessionToken && !sessionUserId) {
      return NextResponse.json(
        { error: '请先登录后再激活会员码' },
        { status: 401 }
      )
    }

    // 获取实际的账户ID
    let accountId = null
    if (accountSessionToken) {
      const session = await prisma.session.findUnique({
        where: { token: accountSessionToken },
        include: { account: true }
      })
      
      if (!session || session.expiresAt < new Date()) {
        return NextResponse.json(
          { error: '用户会话已过期，请重新登录' },
          { status: 401 }
        )
      }
      
      accountId = session.accountId
    }

    // 查找激活码
    const activationCode = await prisma.activationCode.findUnique({
      where: { code },
    })

    if (!activationCode) {
      return NextResponse.json(
        { error: '激活码不存在' },
        { status: 400 }
      )
    }

    // 检查激活码是否已激活
    if (activationCode.isActivated) {
      return NextResponse.json(
        { error: '激活码已被使用' },
        { status: 400 }
      )
    }

    // 检查激活码是否过期
    if (new Date() > activationCode.expiresAt) {
      return NextResponse.json(
        { error: '激活码已过期' },
        { status: 400 }
      )
    }

    // 检查用户是否已有同类型会员（支持两种系统）
    let existingMembership = null
    
    if (accountId) {
      // 账号系统
      existingMembership = await prisma.accountMembership.findFirst({
        where: {
          accountId: accountId,
          type: activationCode.type,
          status: 'active',
          endTime: { gt: new Date() }
        }
      })
    } else if (sessionUserId) {
      // 会话系统
      existingMembership = await prisma.membership.findFirst({
        where: {
          userId: sessionUserId,
          type: activationCode.type,
          status: 'active',
          endTime: { gt: new Date() }
        }
      })
    }

    if (existingMembership) {
      return NextResponse.json(
        { error: '您已拥有该类型的会员' },
        { status: 400 }
      )
    }

    // 获取会员类型信息
    const membershipInfo = getMembershipTypeInfo(activationCode.type)
    
    // 计算会员有效期
    const startTime = new Date()
    const endTime = membershipInfo.duration === -1 
      ? new Date('2099-12-31') // 永久会员
      : new Date(startTime.getTime() + membershipInfo.duration * 24 * 60 * 60 * 1000)

    // 开始事务
    const result = await prisma.$transaction(async (tx) => {
      let membership = null
      
      if (accountId) {
        // 账号系统 - 创建账号会员记录
        membership = await tx.accountMembership.create({
          data: {
            accountId: accountId,
            type: activationCode.type,
            startTime,
            endTime,
            remainingDownloads: membershipInfo.downloads,
            status: 'active'
          }
        })
      } else if (sessionUserId) {
        // 会话系统 - 创建会话会员记录
        membership = await tx.membership.create({
          data: {
            userId: sessionUserId,
            type: activationCode.type,
            startTime,
            endTime,
            remainingDownloads: membershipInfo.downloads,
            status: 'active'
          }
        })
      }

      // 更新激活码状态
      await tx.activationCode.update({
        where: { id: activationCode.id },
        data: {
          isActivated: true,
          activatedAt: new Date(),
          userId: accountId || sessionUserId,
          usageCount: { increment: 1 }
        }
      })

      // 记录激活日志
      await tx.activationLog.create({
        data: {
          code: activationCode.code,
          action: 'activated',
          details: `用户 ${accountId || sessionUserId} 激活了 ${membershipInfo.name}`
        }
      })

      return membership
    })

    // 处理分润计算（仅对账号系统用户）
    if (accountId) {
      // 查找推广关系
      const promotionRelation = await prisma.promotionRelation.findFirst({
        where: { accountId: accountId }
      })

      if (promotionRelation) {
        // 计算分润
        await processCommission(
          promotionRelation.promoterId,
          accountId,
          activationCode.type,
          result?.id,
          activationCode.id
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `${membershipInfo.name}激活成功！`,
      membership: {
        type: activationCode.type,
        name: membershipInfo.name,
        endTime: result?.endTime,
        remainingDownloads: result?.remainingDownloads
      }
    })
  } catch (error: any) {
    console.error('激活会员码失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: '激活失败，请稍后重试', details: error.message },
      { status: 500 }
    )
  }
}
