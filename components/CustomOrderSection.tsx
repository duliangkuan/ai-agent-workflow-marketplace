'use client'

import { useState } from 'react'

export default function CustomOrderSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    demand: '',
    budget: '',
    deadline: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          phone: '',
          demand: '',
          budget: '',
          deadline: ''
        })
      } else {
        setSubmitStatus('error')
        alert(data.error || '提交失败')
      }
    } catch (error) {
      console.error('提交需求失败:', error)
      setSubmitStatus('error')
      alert('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">需求定制</h2>
        <p className="text-gray-600">告诉我们您的具体需求，我们将为您提供专业的定制化解决方案</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 姓名/公司 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              公司主体/个人姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="请输入公司名称或个人姓名"
            />
          </div>

          {/* 联系电话 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              联系电话 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="请输入手机号码"
            />
          </div>

          {/* 需求描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              需求描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="demand"
              value={formData.demand}
              onChange={handleInputChange}
              required
              rows={6}
              className="textarea"
              placeholder="请详细描述您的需求，包括功能要求、使用场景、预期效果等..."
            />
          </div>

          {/* 预算范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              预算范围 <span className="text-red-500">*</span>
            </label>
            <select
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              required
              className="input"
            >
              <option value="">请选择预算范围</option>
              <option value="1000-5000元">1000-5000元</option>
              <option value="5000-10000元">5000-10000元</option>
              <option value="10000-20000元">10000-20000元</option>
              <option value="20000-50000元">20000-50000元</option>
              <option value="50000元以上">50000元以上</option>
              <option value="面议">面议</option>
            </select>
          </div>

          {/* 期望工期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              期望工期 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="如：30天内、2周内、1个月内等"
            />
          </div>

          {/* 提交按钮 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary"
            >
              {isSubmitting ? '提交中...' : '提交需求'}
            </button>
          </div>

          {/* 提交状态 */}
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 font-medium">需求提交成功！我们会尽快联系您。</span>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">提交失败，请稍后重试。</span>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 联系信息 */}
      <div className="mt-8 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">联系我们</h3>
          <p className="text-blue-800 text-lg font-medium">
            15614325230（电话同微信）
          </p>
          <p className="text-blue-600 text-sm mt-2">
            专业团队为您提供一对一咨询服务
          </p>
        </div>
      </div>
    </div>
  )
}
