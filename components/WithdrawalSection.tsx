'use client'

import { useState, useEffect } from 'react'

interface Account {
  id: string
  username: string
  promotionCode: string
  totalEarnings: number
  availableBalance: number
  totalPromotions: number
}

interface Withdrawal {
  id: string
  amount: number
  paymentMethod: string
  status: string
  remark?: string
  createdAt: string
  processedAt?: string
  completedAt?: string
}

interface WithdrawalSectionProps {
  account: Account
  onDataUpdate: () => void
}

export default function WithdrawalSection({ account, onDataUpdate }: WithdrawalSectionProps) {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      const response = await fetch('/api/promotion/withdrawals')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWithdrawals(data.data.withdrawals)
        }
      }
    } catch (error) {
      console.error('获取提现记录失败:', error)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待审核',
      processing: '处理中',
      completed: '已完成',
      rejected: '已拒绝'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'text-yellow-600 bg-yellow-100',
      processing: 'text-blue-600 bg-blue-100',
      completed: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100'
    }
    return colorMap[status as keyof typeof colorMap] || 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="space-y-6">
      {/* 余额信息 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">提现管理</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">可提现余额</p>
            <p className="text-2xl font-bold text-gray-900">¥{account.availableBalance.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">累计收益</p>
            <p className="text-2xl font-bold text-gray-900">¥{account.totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        {account.availableBalance >= 10 && (
          <div className="mt-6">
            <button
              onClick={() => setShowWithdrawForm(true)}
              className="btn-primary"
            >
              申请提现
            </button>
          </div>
        )}

        {account.availableBalance < 10 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              可提现余额不足10元，暂无法申请提现
            </p>
          </div>
        )}
      </div>

      {/* 提现记录 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">提现记录</h3>
        
        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">💳</div>
            <p className="text-gray-600">暂无提现记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ¥{withdrawal.amount.toFixed(2)} 提现申请
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                    {getStatusText(withdrawal.status)}
                  </span>
                  {withdrawal.remark && (
                    <p className="text-xs text-gray-500 mt-1">{withdrawal.remark}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 提现说明 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">提现说明</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• 最小提现金额：10元</p>
          <p>• 提现方式：微信收款码、支付宝收款码</p>
          <p>• 结算时间：每月15号和30号自动结算</p>
          <p>• 处理时间：提现申请提交后1-3个工作日处理</p>
          <p>• 手续费：无手续费，全额到账</p>
        </div>
      </div>

      {/* 提现表单弹窗 */}
      {showWithdrawForm && (
        <WithdrawForm
          account={account}
          onSuccess={() => {
            setShowWithdrawForm(false)
            fetchWithdrawals()
            onDataUpdate()
          }}
          onCancel={() => setShowWithdrawForm(false)}
        />
      )}
    </div>
  )
}

// 提现表单组件
function WithdrawForm({ account, onSuccess, onCancel }: {
  account: Account
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'wechat',
    paymentCode: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await fetch('/api/promotion/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          paymentMethod: formData.paymentMethod,
          paymentCode: formData.paymentCode
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || '提现申请失败')
      }
    } catch (error) {
      console.error('提现申请失败:', error)
      setError('提现申请失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">申请提现</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提现金额
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="10"
              max={account.availableBalance}
              step="0.01"
              className="input"
              placeholder="请输入提现金额"
            />
            <p className="text-xs text-gray-500 mt-1">
              可提现余额：¥{account.availableBalance.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收款方式
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              required
              className="input"
            >
              <option value="wechat">微信收款码</option>
              <option value="alipay">支付宝收款码</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收款码图片URL
            </label>
            <input
              type="url"
              name="paymentCode"
              value={formData.paymentCode}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="请上传收款码图片并输入URL"
            />
            <p className="text-xs text-gray-500 mt-1">
              请先上传收款码图片到图床，然后输入图片URL
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? '提交中...' : '提交申请'}
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
