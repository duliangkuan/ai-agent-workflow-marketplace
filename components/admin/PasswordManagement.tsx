'use client'

import { useState } from 'react'

export default function PasswordManagement() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    idCard: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      setSubmitStatus('error')
      setSubmitMessage('新密码和确认密码不匹配')
      return
    }

    if (formData.newPassword.length < 6) {
      setSubmitStatus('error')
      setSubmitMessage('新密码长度至少6位')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          idCard: formData.idCard,
          newPassword: formData.newPassword
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        setSubmitMessage(data.message)
        setFormData({
          currentPassword: '',
          idCard: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(data.error || '密码修改失败')
      }
    } catch (error) {
      console.error('修改密码失败:', error)
      setSubmitStatus('error')
      setSubmitMessage('修改失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">修改管理员密码</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="请输入当前密码"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              管理员身份证号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="idCard"
              value={formData.idCard}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="请输入身份证号"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              minLength={6}
              className="input"
              placeholder="请输入新密码（至少6位）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认新密码 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              minLength={6}
              className="input"
              placeholder="请再次输入新密码"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary"
          >
            {isSubmitting ? '修改中...' : '修改密码'}
          </button>
        </form>

        {/* 提交状态 */}
        {submitStatus === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">{submitMessage}</span>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">{submitMessage}</span>
            </div>
          </div>
        )}

        {/* 安全提示 */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">安全提示</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• 密码修改成功后，原密码将立即失效</li>
            <li>• 请妥善保管新密码，避免泄露</li>
            <li>• 建议使用包含字母、数字和特殊字符的强密码</li>
            <li>• 修改密码后需要重新登录</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
