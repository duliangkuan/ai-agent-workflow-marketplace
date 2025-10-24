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
  const [uploadingFiles, setUploadingFiles] = useState({
    video: false,
    source: false,
    guide: false
  })

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

  const handleFileUpload = async (file: File, type: 'video' | 'source' | 'guide') => {
    setUploadingFiles(prev => ({ ...prev, [type]: true }))

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          [`${type}Url`]: data.url
        }))
        alert('文件上传成功')
      } else {
        alert(data.error || '文件上传失败')
      }
    } catch (error) {
      console.error('文件上传失败:', error)
      alert('文件上传失败，请稍后重试')
    } finally {
      setUploadingFiles(prev => ({ ...prev, [type]: false }))
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

          {/* 文件上传 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">文件资源</h3>

            {/* 效果展示视频 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                效果展示视频
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'video')
                  }}
                  disabled={uploadingFiles.video}
                  className="flex-1"
                />
                {uploadingFiles.video && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                )}
              </div>
              {formData.videoUrl && (
                <p className="text-sm text-green-600 mt-1">✓ 视频已上传</p>
              )}
            </div>

            {/* 源文件压缩包 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                源文件压缩包
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept=".zip,.rar,.7z"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'source')
                  }}
                  disabled={uploadingFiles.source}
                  className="flex-1"
                />
                {uploadingFiles.source && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                )}
              </div>
              {formData.sourceUrl && (
                <p className="text-sm text-green-600 mt-1">✓ 源文件已上传</p>
              )}
            </div>

            {/* 使用说明文件 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                使用说明文件
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="video/mp4,application/pdf,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'guide')
                  }}
                  disabled={uploadingFiles.guide}
                  className="flex-1"
                />
                {uploadingFiles.guide && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                )}
              </div>
              {formData.guideUrl && (
                <p className="text-sm text-green-600 mt-1">✓ 说明文件已上传</p>
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
