'use client'

import { useState } from 'react'

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      setError('登录失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">登录账号</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            用户名/邮箱
          </label>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleInputChange}
            required
            className="input"
            placeholder="请输入用户名或邮箱"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            密码
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="input"
            placeholder="请输入密码"
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
          {isSubmitting ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          还没有账号？{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            立即注册
          </button>
        </p>
      </div>
    </div>
  )
}
