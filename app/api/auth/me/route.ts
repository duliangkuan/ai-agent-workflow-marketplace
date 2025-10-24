import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountSessionId } from '@/lib/account-auth'

export async function GET(request: NextRequest) {
  try {
    const sessionId = await getAccountSessionId()
    if (!sessionId) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    // 查找用户账号
    const account = await prisma.account.findUnique({
      where: { id: sessionId },
      include: {
        accountMemberships: {
          where: {
            status: 'active',
            endTime: { gt: new Date() }
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取当前会员信息
    const currentMembership = account.accountMemberships[0] || null

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
        promotionCode: account.promotionCode,
        totalEarnings: account.totalEarnings,
        availableBalance: account.availableBalance,
        totalPromotions: account.totalPromotions,
        currentMembership: currentMembership ? {
          type: currentMembership.type,
          endTime: currentMembership.endTime,
          remainingDownloads: currentMembership.remainingDownloads
        } : null
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}
