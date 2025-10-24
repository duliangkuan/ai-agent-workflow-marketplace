import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSessionId, verifyPassword, hashPassword } from '@/lib/auth'

async function verifyAdmin() {
  const sessionId = await getAdminSessionId()
  if (!sessionId) {
    throw new Error('未授权访问')
  }
}

export async function PUT(request: NextRequest) {
  try {
    await verifyAdmin()

    const body = await request.json()
    const { currentPassword, idCard, newPassword } = body

    if (!currentPassword || !idCard || !newPassword) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证身份证号
    if (idCard !== process.env.ADMIN_ID_CARD) {
      return NextResponse.json(
        { error: '身份证号错误' },
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

    // 验证当前密码
    const isValid = await verifyPassword(currentPassword, admin.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: '当前密码错误' },
        { status: 400 }
      )
    }

    // 验证新密码强度
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少6位' },
        { status: 400 }
      )
    }

    // 更新密码
    const newPasswordHash = await hashPassword(newPassword)
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: newPasswordHash,
        isInitial: false
      }
    })

    return NextResponse.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '修改密码失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}
