import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSessionId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const adminSessionId = await getAdminSessionId()
    if (!adminSessionId) {
      return NextResponse.json(
        { error: '管理员未登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // 获取有分润的推广员
    const [promoters, total] = await Promise.all([
      prisma.account.findMany({
        where: {
          totalEarnings: { gt: 0 }
        },
        include: {
          promotedUsers: {
            include: {
              account: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          },
          commissionRecordsAsPromoter: {
            where: { status: 'confirmed' },
            orderBy: { createdAt: 'desc' }
          },
          withdrawals: {
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' }
          }
        },
        skip,
        take: limit,
        orderBy: { totalEarnings: 'desc' }
      }),
      prisma.account.count({
        where: {
          totalEarnings: { gt: 0 }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        promoters: promoters.map(promoter => ({
          id: promoter.id,
          username: promoter.username,
          email: promoter.email,
          promotionCode: promoter.promotionCode,
          totalEarnings: promoter.totalEarnings,
          availableBalance: promoter.availableBalance,
          totalPromotions: promoter.totalPromotions,
          promotedUsersCount: promoter.promotedUsers.length,
          recentCommissions: promoter.commissionRecordsAsPromoter.slice(0, 5).map(record => ({
            id: record.id,
            amount: record.amount,
            membershipType: record.membershipType,
            createdAt: record.createdAt
          })),
          pendingWithdrawals: promoter.withdrawals.map(withdrawal => ({
            id: withdrawal.id,
            amount: withdrawal.amount,
            paymentMethod: withdrawal.paymentMethod,
            paymentCode: withdrawal.paymentCode,
            createdAt: withdrawal.createdAt
          }))
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取推广员数据失败:', error)
    return NextResponse.json(
      { error: '获取推广员数据失败' },
      { status: 500 }
    )
  }
}
