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
    const status = searchParams.get('status') || 'all'

    const whereClause = status !== 'all' ? { status } : {}

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawal.findMany({
        where: whereClause,
        include: {
          promoter: {
            select: {
              id: true,
              username: true,
              email: true,
              promotionCode: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.withdrawal.count({
        where: whereClause
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: withdrawals.map(withdrawal => ({
          id: withdrawal.id,
          amount: withdrawal.amount,
          paymentMethod: withdrawal.paymentMethod,
          paymentCode: withdrawal.paymentCode,
          status: withdrawal.status,
          remark: withdrawal.remark,
          createdAt: withdrawal.createdAt,
          processedAt: withdrawal.processedAt,
          completedAt: withdrawal.completedAt,
          promoter: withdrawal.promoter
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

export async function PUT(request: NextRequest) {
  try {
    const adminSessionId = await getAdminSessionId()
    if (!adminSessionId) {
      return NextResponse.json(
        { error: '管理员未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { withdrawalId, status, remark } = body

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { error: '参数不完整' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'processing', 'completed', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '状态无效' },
        { status: 400 }
      )
    }

    // 更新提现状态
    const updateData: any = {
      status,
      processedAt: new Date()
    }

    if (status === 'completed' || status === 'rejected') {
      updateData.completedAt = new Date()
    }

    if (remark) {
      updateData.remark = remark
    }

    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: '提现状态更新成功'
    })
  } catch (error) {
    console.error('更新提现状态失败:', error)
    return NextResponse.json(
      { error: '更新提现状态失败' },
      { status: 500 }
    )
  }
}
