import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'
import { getMembershipTypeInfo } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json(
        { error: '用户会话无效' },
        { status: 401 }
      )
    }

    // 获取用户当前有效的会员信息
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: 'active',
        endTime: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!membership) {
      return NextResponse.json({
        hasMembership: false,
        membership: null
      })
    }

    const membershipInfo = getMembershipTypeInfo(membership.type)

    return NextResponse.json({
      hasMembership: true,
      membership: {
        id: membership.id,
        type: membership.type,
        name: membershipInfo.name,
        price: membershipInfo.price,
        features: membershipInfo.features,
        startTime: membership.startTime,
        endTime: membership.endTime,
        remainingDownloads: membership.remainingDownloads,
        isUnlimited: membershipInfo.downloads === -1
      }
    })
  } catch (error) {
    console.error('获取用户会员信息失败:', error)
    return NextResponse.json(
      { error: '获取会员信息失败' },
      { status: 500 }
    )
  }
}
