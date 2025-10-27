'use client'

import { useState, useEffect } from 'react'

interface Product {
  id: string
  title: string
  description: string
  type: string
  videoUrl?: string
  sourceUrl?: string
  guideUrl?: string
  purchaseCount: number
  createdAt: string
}

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
  onCancel: () => void
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'agent',
    videoUrl: '',
    sourceUrl: '',
    guideUrl: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        type: product.type,
        videoUrl: product.videoUrl || '',
        sourceUrl: product.sourceUrl || '',
        guideUrl: product.guideUrl || ''
      })
    }
  }, [product])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = '/api/admin/products'
      const method = product ? 'PUT' : 'POST'
      const body = product ? { id: product.id, ...formData } : formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        alert(product ? '产品更新成功' : '产品创建成功')
        onSuccess()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('提交失败:', error)
      alert('操作失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {product ? '编辑产品' : '添加产品'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基础信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                产品标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="input"
                placeholder="请输入产品标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                产品类型 <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="input"
              >
                <option value="agent">智能体</option>
                <option value="workflow">工作流</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="textarea"
              placeholder="请输入产品描述"
            />
          </div>

          {/* 资源链接 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">资源链接</h3>

            {/* 效果展示视频链接 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                效果展示视频链接
              </label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="input"
                placeholder="请输入视频链接 (如: https://example.com/video.mp4)"
              />
              {formData.videoUrl && !validateUrl(formData.videoUrl) && (
                <p className="text-sm text-red-600 mt-1">请输入有效的URL链接</p>
              )}
              {formData.videoUrl && validateUrl(formData.videoUrl) && (
                <p className="text-sm text-green-600 mt-1">✓ 视频链接已设置</p>
              )}
            </div>

            {/* 源文件压缩包链接 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                源文件压缩包链接
              </label>
              <input
                type="url"
                name="sourceUrl"
                value={formData.sourceUrl}
                onChange={handleInputChange}
                className="input"
                placeholder="请输入压缩包下载链接 (如: https://example.com/files.zip)"
              />
              {formData.sourceUrl && !validateUrl(formData.sourceUrl) && (
                <p className="text-sm text-red-600 mt-1">请输入有效的URL链接</p>
              )}
              {formData.sourceUrl && validateUrl(formData.sourceUrl) && (
                <p className="text-sm text-green-600 mt-1">✓ 源文件链接已设置</p>
              )}
            </div>

            {/* 使用说明文件链接 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用说明文件链接
              </label>
              <input
                type="url"
                name="guideUrl"
                value={formData.guideUrl}
                onChange={handleInputChange}
                className="input"
                placeholder="请输入说明文件链接 (如: https://example.com/guide.pdf)"
              />
              {formData.guideUrl && !validateUrl(formData.guideUrl) && (
                <p className="text-sm text-red-600 mt-1">请输入有效的URL链接</p>
              )}
              {formData.guideUrl && validateUrl(formData.guideUrl) && (
                <p className="text-sm text-green-600 mt-1">✓ 说明文件链接已设置</p>
              )}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? '保存中...' : (product ? '更新产品' : '创建产品')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
