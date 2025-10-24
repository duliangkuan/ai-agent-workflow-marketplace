import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSessionId } from '@/lib/auth'
import { generateActivationCode } from '@/lib/utils'

async function verifyAdmin() {
  const sessionId = await getAdminSessionId()
  if (!sessionId) {
    throw new Error('未授权访问')
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (status === 'activated') {
      where.isActivated = true
    } else if (status === 'unactivated') {
      where.isActivated = false
    }

    const [codes, total] = await Promise.all([
      prisma.activationCode.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          logs: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      }),
      prisma.activationCode.count({ where })
    ])

    return NextResponse.json({
      codes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取激活码列表失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取激活码列表失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}
