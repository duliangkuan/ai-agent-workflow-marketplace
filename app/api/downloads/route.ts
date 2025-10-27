import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserId } from '@/lib/auth'
import { getAccountSessionId } from '@/lib/account-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId } = body

    // 优先使用账号系统，回退到会话系统
    const accountSessionToken = await getAccountSessionId()
    const sessionUserId = await getUserId()
    
    if (!accountSessionToken && !sessionUserId) {
      return NextResponse.json(
        { error: '请先登录后再下载' },
        { status: 401 }
      )
    }

    // 获取实际的账户ID
    let accountId = null
    if (accountSessionToken) {
      const session = await prisma.session.findUnique({
        where: { token: accountSessionToken },
        include: { account: true }
      })
      
      if (!session || session.expiresAt < new Date()) {
        return NextResponse.json(
          { error: '用户会话已过期，请重新登录' },
          { status: 401 }
        )
      }
      
      accountId = session.accountId
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

    // 检查用户会员状态（支持两种系统）
    let membership = null
    let userId = accountId || sessionUserId
    
    if (accountId) {
      // 账号系统
      membership = await prisma.accountMembership.findFirst({
        where: {
          accountId: accountId,
          status: 'active',
          endTime: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else if (sessionUserId) {
      // 会话系统
      membership = await prisma.membership.findFirst({
        where: {
          userId: sessionUserId,
          status: 'active',
          endTime: { gt: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

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
        guideUrl: product.guideUrl,
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
        if (accountId) {
          // 账号系统
          await tx.accountMembership.update({
            where: { id: membership.id },
            data: {
              remainingDownloads: { decrement: 1 }
            }
          })
        } else {
          // 会话系统
          await tx.membership.update({
            where: { id: membership.id },
            data: {
              remainingDownloads: { decrement: 1 }
            }
          })
        }
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
      guideUrl: product.guideUrl,
      message: '获取下载链接成功'
    })
  } catch (error) {
    console.error('下载产品失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: '下载失败，请稍后重试', details: error.message },
      { status: 500 }
    )
  }
}
