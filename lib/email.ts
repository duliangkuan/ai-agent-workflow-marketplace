import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 587,
  secure: false, // 587端口使用TLS
  auth: {
    user: '2330304961@qq.com',
    pass: 'xrzimvjwqqxmebig', // QQ邮箱授权码
  },
})

export async function sendCustomOrderEmail(orderData: {
  name: string
  phone: string
  demand: string
  budget: string
  deadline: string
}) {
  const mailOptions = {
    from: '2330304961@qq.com',
    to: '2330304961@qq.com',
    subject: '新的定制需求提交',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">新的定制需求提交</h2>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">客户信息</h3>
          <p><strong>姓名/公司：</strong>${orderData.name}</p>
          <p><strong>联系电话：</strong>${orderData.phone}</p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">需求详情</h3>
          <p><strong>需求描述：</strong></p>
          <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
            ${orderData.demand.replace(/\n/g, '<br>')}
          </p>
          <p><strong>预算范围：</strong>${orderData.budget}</p>
          <p><strong>期望工期：</strong>${orderData.deadline}</p>
        </div>
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af;">
            <strong>请及时联系客户：</strong>${orderData.phone}
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          此邮件由智能体与工作流售卖网站自动发送
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('邮件发送失败:', error)
    return { success: false, error: error instanceof Error ? error.message : '未知错误' }
  }
}
