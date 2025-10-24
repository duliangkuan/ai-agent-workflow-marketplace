import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getAdminSessionId } from '@/lib/auth'

async function verifyAdmin() {
  const sessionId = await getAdminSessionId()
  if (!sessionId) {
    throw new Error('未授权访问')
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdmin()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'video', 'source', 'guide'

    if (!file) {
      return NextResponse.json(
        { error: '请选择文件' },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        { error: '请指定文件类型' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      source: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
      guide: ['video/mp4', 'application/pdf', 'text/plain']
    }

    if (!allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型' },
        { status: 400 }
      )
    }

    // 验证文件大小 (100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过100MB' },
        { status: 400 }
      )
    }

    // 生成文件名
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${type}_${timestamp}.${extension}`

    // 上传到 Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '文件上传失败' },
      { status: error instanceof Error && error.message === '未授权访问' ? 401 : 500 }
    )
  }
}
