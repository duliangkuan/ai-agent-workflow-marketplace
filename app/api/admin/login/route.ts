import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, setAdminSession } from '@/lib/auth'
import { generateSessionId } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: '请输入密码' },
        { status: 400 }
      )
    }

    // 获取管理员信息
    const admin = await prisma.admin.findFirst()
    
    if (!admin) {
      return NextResponse.json(
        { error: '管理员账户不存在' },
        { status: 404 }
      )
    }

    // 验证密码
    const isValid = await verifyPassword(password, admin.passwordHash)
    
    if (!isValid) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }

    // 生成管理员会话
    const sessionId = generateSessionId()
    await setAdminSession(sessionId)

    return NextResponse.json({
      success: true,
      message: '登录成功',
      sessionId
    })
  } catch (error) {
    console.error('管理员登录失败:', error)
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    )
  }
}
