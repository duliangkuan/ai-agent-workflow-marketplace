import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSessionId } from '@/lib/auth'

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
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { purchaseCount: 'desc' },
        include: {
          _count: {
            select: {
              downloadRecords: true,
              favorites: true
            }
          }
        }
      }),
      prisma.product.count()
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取产品列表失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取产品列表失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin()

    const body = await request.json()
    const { title, description, type, videoUrl, sourceUrl, guideUrl } = body

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        type,
        videoUrl,
        sourceUrl,
        guideUrl
      }
    })

    return NextResponse.json({
      success: true,
      message: '产品创建成功',
      product
    })
  } catch (error) {
    console.error('创建产品失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建产品失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await verifyAdmin()

    const body = await request.json()
    const { id, title, description, type, videoUrl, sourceUrl, guideUrl } = body

    if (!id) {
      return NextResponse.json(
        { error: '产品ID不能为空' },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        type,
        videoUrl,
        sourceUrl,
        guideUrl
      }
    })

    return NextResponse.json({
      success: true,
      message: '产品更新成功',
      product
    })
  } catch (error) {
    console.error('更新产品失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新产品失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await verifyAdmin()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '产品ID不能为空' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '产品删除成功'
    })
  } catch (error) {
    console.error('删除产品失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除产品失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}
