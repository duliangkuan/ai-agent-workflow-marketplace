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

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin()

    const body = await request.json()
    const { type, count = 1, expiresInDays = 30 } = body

    if (!type) {
      return NextResponse.json(
        { error: '请选择会员类型' },
        { status: 400 }
      )
    }

    const validTypes = ['temporary', 'regular', 'premium', 'super']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: '无效的会员类型' },
        { status: 400 }
      )
    }

    if (count < 1 || count > 100) {
      return NextResponse.json(
        { error: '生成数量必须在1-100之间' },
        { status: 400 }
      )
    }

    const codes = []
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)

    // 批量生成激活码
    for (let i = 0; i < count; i++) {
      let code: string
      let isUnique = false
      
      // 确保激活码唯一性
      while (!isUnique) {
        code = generateActivationCode()
        const existing = await prisma.activationCode.findUnique({
          where: { code }
        })
        if (!existing) {
          isUnique = true
        }
      }

      const activationCode = await prisma.activationCode.create({
        data: {
          code: code!,
          type,
          expiresAt
        }
      })

      // 记录生成日志
      await prisma.activationLog.create({
        data: {
          code: code!,
          action: 'generated',
          details: `管理员生成了 ${type} 类型激活码，有效期 ${expiresInDays} 天`
        }
      })

      codes.push(activationCode)
    }

    return NextResponse.json({
      success: true,
      message: `成功生成 ${count} 个激活码`,
      codes: codes.map(code => ({
        id: code.id,
        code: code.code,
        type: code.type,
        expiresAt: code.expiresAt
      }))
    })
  } catch (error) {
    console.error('生成激活码失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成激活码失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}
