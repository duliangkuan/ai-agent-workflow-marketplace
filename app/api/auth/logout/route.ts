import { NextRequest, NextResponse } from 'next/server'
import { clearAccountSession } from '@/lib/account-auth'

export async function POST(request: NextRequest) {
  try {
    await clearAccountSession()

    return NextResponse.json({
      success: true,
      message: '退出登录成功'
    })
  } catch (error) {
    console.error('退出登录失败:', error)
    return NextResponse.json(
      { error: '退出登录失败' },
      { status: 500 }
    )
  }
}
