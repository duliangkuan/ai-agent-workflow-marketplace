'use client'

import { useState } from 'react'

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // 验证密码确认
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      setIsSubmitting(false)
      return
    }

    try {
      // 获取推广码
      const promotionCode = localStorage.getItem('promotionCode')
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          promotionCode: promotionCode
        }),
      })

      const data = await response.json()

      if (data.success) {
        // 注册成功后清除推广码
        localStorage.removeItem('promotionCode')
        onSuccess()
      } else {
        setError(data.error || '注册失败')
      }
    } catch (error) {
      console.error('注册失败:', error)
      setError('注册失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">注册账号</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            用户名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="input"
            placeholder="3-20位字母、数字、下划线"
          />
          <p className="text-xs text-gray-500 mt-1">用户名将用于登录和显示</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            邮箱 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="input"
            placeholder="请输入邮箱地址"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="input"
            placeholder="至少6位密码"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            确认密码 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            minLength={6}
            className="input"
            placeholder="请再次输入密码"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary"
        >
          {isSubmitting ? '注册中...' : '注册账号'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          已有账号？{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  )
}
