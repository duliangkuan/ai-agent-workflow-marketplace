import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAccountSessionId } from '@/lib/account-auth'

export async function GET(request: NextRequest) {
  try {
    const accountId = await getAccountSessionId()
    if (!accountId) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: { promoterId: accountId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.withdrawal.count({
        where: { promoterId: accountId }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: withdrawals.map(withdrawal => ({
          id: withdrawal.id,
          amount: withdrawal.amount,
          paymentMethod: withdrawal.paymentMethod,
          status: withdrawal.status,
          remark: withdrawal.remark,
          createdAt: withdrawal.createdAt,
          processedAt: withdrawal.processedAt,
          completedAt: withdrawal.completedAt
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
    console.error('获取提现记录失败:', error)
    return NextResponse.json(
      { error: '获取提现记录失败' },
      { status: 500 }
    )
  }
}
