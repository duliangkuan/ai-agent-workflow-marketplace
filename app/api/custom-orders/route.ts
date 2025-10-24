import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendCustomOrderEmail } from '@/lib/email'
import { validatePhone } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, demand, budget, deadline } = body

    // 验证必填字段
    if (!name || !phone || !demand || !budget || !deadline) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    // 验证手机号格式
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: '请输入正确的手机号格式' },
        { status: 400 }
      )
    }

    // 保存到数据库
    const order = await prisma.customOrder.create({
      data: {
        name,
        phone,
        demand,
        budget,
        deadline,
      },
    })

    // 发送邮件
    const emailResult = await sendCustomOrderEmail({
      name,
      phone,
      demand,
      budget,
      deadline,
    })

    if (!emailResult.success) {
      console.error('邮件发送失败:', emailResult.error)
      // 即使邮件发送失败，也返回成功，因为数据已保存
    }

    return NextResponse.json({
      success: true,
      message: '需求提交成功，我们会尽快联系您！',
      orderId: order.id
    })
  } catch (error) {
    console.error('提交定制需求失败:', error)
    return NextResponse.json(
      { error: '提交失败，请稍后重试' },
      { status: 500 }
    )
  }
}
