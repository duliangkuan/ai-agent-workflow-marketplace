import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId } = body

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

    // 检查产品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: '产品不存在' },
        { status: 404 }
      )
    }

    if (!product.sourceUrl) {
      return NextResponse.json(
        { error: '该产品暂无下载资源' },
        { status: 400 }
      )
    }

    // 检查用户会员状态
    const membership = await prisma.membership.findFirst({
      where: {
        userId,
        status: 'active',
        endTime: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!membership) {
      return NextResponse.json(
        { error: '请先开通会员才能下载资源' },
        { status: 403 }
      )
    }

    // 检查下载次数限制（临时会员和普通会员有次数限制）
    if (membership.remainingDownloads !== -1 && membership.remainingDownloads <= 0) {
      return NextResponse.json(
        { error: '您的下载次数已用完' },
        { status: 403 }
      )
    }

    // 检查是否已经下载过该产品
    const existingDownload = await prisma.downloadRecord.findFirst({
      where: {
        userId,
        productId
      }
    })

    if (existingDownload) {
      return NextResponse.json({
        success: true,
        downloadUrl: product.sourceUrl,
        message: '获取下载链接成功'
      })
    }

    // 开始事务
    await prisma.$transaction(async (tx) => {
      // 记录下载历史
      await tx.downloadRecord.create({
        data: {
          userId,
          productId
        }
      })

      // 扣减下载次数（如果不是无限下载）
      if (membership.remainingDownloads !== -1) {
        await tx.membership.update({
          where: { id: membership.id },
          data: {
            remainingDownloads: { decrement: 1 }
          }
        })
      }

      // 增加产品购买量
      await tx.product.update({
        where: { id: productId },
        data: {
          purchaseCount: { increment: 1 }
        }
      })
    })

    return NextResponse.json({
      success: true,
      downloadUrl: product.sourceUrl,
      message: '获取下载链接成功'
    })
  } catch (error) {
    console.error('下载产品失败:', error)
    return NextResponse.json(
      { error: '下载失败，请稍后重试' },
      { status: 500 }
    )
  }
}
