import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSessionId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const adminSessionId = await getAdminSessionId()
    if (!adminSessionId) {
      return NextResponse.json(
        { error: '管理员未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { promoterId } = body

    if (!promoterId) {
      return NextResponse.json(
        { error: '推广员ID不能为空' },
        { status: 400 }
      )
    }

    // 查找推广员
    const promoter = await prisma.account.findUnique({
      where: { id: promoterId }
    })

    if (!promoter) {
      return NextResponse.json(
        { error: '推广员不存在' },
        { status: 404 }
      )
    }

    // 清零余额
    await prisma.account.update({
      where: { id: promoterId },
      data: {
        availableBalance: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: '推广员余额已清零'
    })
  } catch (error) {
    console.error('清零推广员余额失败:', error)
    return NextResponse.json(
      { error: '清零推广员余额失败' },
      { status: 500 }
    )
  }
}
