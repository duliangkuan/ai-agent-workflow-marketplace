'use client'

import { useState } from 'react'

interface ActivationFormProps {
  onSuccess: () => void
}

export default function ActivationForm({ onSuccess }: ActivationFormProps) {
  const [activationCode, setActivationCode] = useState('')
  const [isActivating, setIsActivating] = useState(false)
  const [activationStatus, setActivationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [activationMessage, setActivationMessage] = useState('')

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activationCode.trim()) {
      setActivationStatus('error')
      setActivationMessage('请输入激活码')
      return
    }

    setIsActivating(true)
    setActivationStatus('idle')

    try {
      const response = await fetch('/api/activation-codes/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: activationCode.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setActivationStatus('success')
        setActivationMessage(data.message)
        setActivationCode('')
        // 延迟调用成功回调，让用户看到成功消息
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setActivationStatus('error')
        setActivationMessage(data.error || '激活失败')
      }
    } catch (error) {
      console.error('激活会员码失败:', error)
      setActivationStatus('error')
      setActivationMessage('激活失败，请稍后重试')
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <div className="card">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">会员码激活</h3>
        <p className="text-gray-600">输入您的会员激活码来开通会员权益</p>
      </div>

      <form onSubmit={handleActivate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            激活码
          </label>
          <input
            type="text"
            value={activationCode}
            onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
            placeholder="请输入12位激活码"
            className="input text-center text-lg tracking-wider"
            maxLength={12}
            disabled={isActivating}
          />
          <p className="text-xs text-gray-500 mt-1">
            激活码通常为12位大写字母和数字组合
          </p>
        </div>

        <button
          type="submit"
          disabled={isActivating || !activationCode.trim()}
          className="w-full btn-primary"
        >
          {isActivating ? '激活中...' : '激活会员'}
        </button>
      </form>

      {/* 激活状态提示 */}
      {activationStatus === 'success' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-700 font-medium">{activationMessage}</span>
          </div>
        </div>
      )}

      {activationStatus === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-medium">{activationMessage}</span>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">使用说明：</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 激活码由客服在您完成支付后提供</li>
          <li>• 每个激活码只能使用一次</li>
          <li>• 激活码有有效期限制，请及时使用</li>
          <li>• 如有问题请联系客服：15614325230</li>
        </ul>
      </div>
    </div>
  )
}
