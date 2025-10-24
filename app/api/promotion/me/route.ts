import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountSessionId } from '@/lib/account-auth'
import { getNextSettlementDate, formatSettlementDate } from '@/lib/commission'

export async function GET(request: NextRequest) {
  try {
    const accountId = await getAccountSessionId()
    if (!accountId) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取推广员信息
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        promotedUsers: {
          include: {
            account: {
              select: {
                id: true,
                username: true,
                email: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        commissionRecordsAsPromoter: {
          where: { status: 'confirmed' },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!account) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取本月分润统计
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const monthlyCommissions = await prisma.commissionRecord.aggregate({
      where: {
        promoterId: accountId,
        status: 'confirmed',
        createdAt: { gte: startOfMonth }
      },
      _sum: { amount: true },
      _count: true
    })

    // 获取下次结算时间
    const nextSettlementDate = getNextSettlementDate()

    return NextResponse.json({
      success: true,
      data: {
        account: {
          id: account.id,
          username: account.username,
          promotionCode: account.promotionCode,
          totalEarnings: account.totalEarnings,
          availableBalance: account.availableBalance,
          totalPromotions: account.totalPromotions
        },
        promotionLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}?ref=${account.promotionCode}`,
        promotedUsers: account.promotedUsers.map(relation => ({
          id: relation.account.id,
          username: relation.account.username,
          email: relation.account.email,
          joinedAt: relation.createdAt,
          totalPurchaseAmount: relation.totalPurchaseAmount,
          totalCommission: relation.totalCommission
        })),
        recentCommissions: account.commissionRecordsAsPromoter.map(record => ({
          id: record.id,
          amount: record.amount,
          membershipType: record.membershipType,
          membershipPrice: record.membershipPrice,
          rate: record.rate,
          createdAt: record.createdAt
        })),
        monthlyStats: {
          totalAmount: monthlyCommissions._sum.amount || 0,
          totalCount: monthlyCommissions._count || 0
        },
        nextSettlementDate: formatSettlementDate(nextSettlementDate)
      }
    })
  } catch (error) {
    console.error('获取推广信息失败:', error)
    return NextResponse.json(
      { error: '获取推广信息失败' },
      { status: 500 }
    )
  }
}
