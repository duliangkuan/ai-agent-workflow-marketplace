'use client'

import { useState } from 'react'

interface ActivationCodeGeneratorProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function ActivationCodeGenerator({ onSuccess, onCancel }: ActivationCodeGeneratorProps) {
  const [formData, setFormData] = useState({
    type: 'temporary',
    count: 1,
    expiresInDays: 30
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'count' || name === 'expiresInDays' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch('/api/admin/activation-codes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        onSuccess()
      } else {
        alert(data.error || '生成失败')
      }
    } catch (error) {
      console.error('生成激活码失败:', error)
      alert('生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const getMembershipTypeName = (type: string) => {
    const types = {
      temporary: '临时会员',
      regular: '普通会员',
      premium: '高级会员',
      super: '超级会员'
    }
    return types[type as keyof typeof types] || type
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">生成激活码</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              会员类型 <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="input"
            >
              <option value="temporary">临时会员 (¥49.8)</option>
              <option value="regular">普通会员 (¥398)</option>
              <option value="premium">高级会员 (¥998)</option>
              <option value="super">超级会员 (¥3999)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生成数量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              required
              min="1"
              max="100"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">最多100个</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              有效期（天） <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="expiresInDays"
              value={formData.expiresInDays}
              onChange={handleInputChange}
              required
              min="1"
              max="365"
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">激活码有效期</p>
          </div>
        </div>

        {/* 预览信息 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">生成预览</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>会员类型：{getMembershipTypeName(formData.type)}</p>
            <p>生成数量：{formData.count} 个</p>
            <p>有效期：{formData.expiresInDays} 天</p>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={isGenerating}
            className="btn-primary flex-1"
          >
            {isGenerating ? '生成中...' : '生成激活码'}
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
  )
}
