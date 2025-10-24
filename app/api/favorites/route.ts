import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, action } = body // action: 'add' or 'remove'

    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json(
        { error: '用户会话无效' },
        { status: 401 }
      )
    }

    if (!productId) {
      return NextResponse.json(
        { error: '产品ID不能为空' },
        { status: 400 }
      )
    }

    if (action === 'add') {
      // 添加收藏
      await prisma.userFavorite.upsert({
        where: {
          userId_productId: {
            userId,
            productId
          }
        },
        update: {},
        create: {
          userId,
          productId
        }
      })
    } else if (action === 'remove') {
      // 取消收藏
      await prisma.userFavorite.deleteMany({
        where: {
          userId,
          productId
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: action === 'add' ? '已添加到收藏' : '已取消收藏'
    })
  } catch (error) {
    console.error('操作收藏失败:', error)
    return NextResponse.json(
      { error: '操作失败，请稍后重试' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json(
        { error: '用户会话无效' },
        { status: 401 }
      )
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            _count: {
              select: {
                downloadRecords: true,
                favorites: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      favorites: favorites.map(fav => fav.product)
    })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json(
      { error: '获取收藏列表失败' },
      { status: 500 }
    )
  }
}
