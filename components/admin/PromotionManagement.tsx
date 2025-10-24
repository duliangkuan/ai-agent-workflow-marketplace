'use client'

import { useState, useEffect } from 'react'

interface Promoter {
  id: string
  username: string
  email: string
  promotionCode: string
  totalEarnings: number
  availableBalance: number
  totalPromotions: number
  promotedUsersCount: number
  recentCommissions: Array<{
    id: string
    amount: number
    membershipType: string
    createdAt: string
  }>
  pendingWithdrawals: Array<{
    id: string
    amount: number
    paymentMethod: string
    paymentCode: string
    createdAt: string
  }>
}

interface Withdrawal {
  id: string
  amount: number
  paymentMethod: string
  paymentCode: string
  status: string
  remark?: string
  createdAt: string
  processedAt?: string
  completedAt?: string
  promoter: {
    id: string
    username: string
    email: string
    promotionCode: string
  }
}

export default function PromotionManagement() {
  const [activeTab, setActiveTab] = useState<'promoters' | 'withdrawals'>('promoters')
  const [promoters, setPromoters] = useState<Promoter[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    if (activeTab === 'promoters') {
      fetchPromoters()
    } else {
      fetchWithdrawals()
    }
  }, [activeTab, selectedStatus])

  const fetchPromoters = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/promotion')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPromoters(data.data.promoters)
        }
      }
    } catch (error) {
      console.error('获取推广员数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      const url = selectedStatus === 'all' 
        ? '/api/admin/promotion/withdrawals'
        : `/api/admin/promotion/withdrawals?status=${selectedStatus}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setWithdrawals(data.data.withdrawals)
        }
      }
    } catch (error) {
      console.error('获取提现记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearBalance = async (promoterId: string) => {
    if (!confirm('确定要清零该推广员的余额吗？')) {
      return
    }

    try {
      const response = await fetch('/api/admin/promotion/clear-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promoterId }),
      })

      const data = await response.json()
      if (data.success) {
        alert('余额清零成功')
        fetchPromoters()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('清零余额失败:', error)
      alert('操作失败')
    }
  }

  const handleWithdrawalStatusChange = async (withdrawalId: string, status: string, remark?: string) => {
    try {
      const response = await fetch('/api/admin/promotion/withdrawals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ withdrawalId, status, remark }),
      })

      const data = await response.json()
      if (data.success) {
        alert('状态更新成功')
        fetchWithdrawals()
      } else {
        alert(data.error || '操作失败')
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      alert('操作失败')
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">推广管理</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('promoters')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'promoters'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            推广员管理
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'withdrawals'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            提现管理
          </button>
        </div>
      </div>

      {activeTab === 'promoters' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">推广员列表</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          ) : promoters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">暂无推广员数据</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      推广员信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      推广数据
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      收益统计
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promoters.map((promoter) => (
                    <tr key={promoter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {promoter.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {promoter.email}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {promoter.promotionCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          推广人数: {promoter.promotedUsersCount}
                        </div>
                        <div className="text-sm text-gray-500">
                          总推广: {promoter.totalPromotions}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          累计收益: ¥{promoter.totalEarnings.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          可提现: ¥{promoter.availableBalance.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleClearBalance(promoter.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          清零余额
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">提现管理</h3>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input w-32"
            >
              <option value="all">全部状态</option>
              <option value="pending">待审核</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">暂无提现记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {withdrawal.promoter.username} 的提现申请
                      </h4>
                      <p className="text-xs text-gray-500">
                        {withdrawal.promoter.email} | {withdrawal.promoter.promotionCode}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                      {getStatusText(withdrawal.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">提现金额</p>
                      <p className="text-lg font-bold text-gray-900">¥{withdrawal.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">收款方式</p>
                      <p className="text-sm text-gray-900">
                        {withdrawal.paymentMethod === 'wechat' ? '微信' : '支付宝'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">申请时间</p>
                      <p className="text-sm text-gray-900">
                        {new Date(withdrawal.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>

                  {withdrawal.paymentCode && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">收款码</p>
                      <img
                        src={withdrawal.paymentCode}
                        alt="收款码"
                        className="w-32 h-32 border border-gray-200 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  {withdrawal.remark && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">备注</p>
                      <p className="text-sm text-gray-900">{withdrawal.remark}</p>
                    </div>
                  )}

                  {withdrawal.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleWithdrawalStatusChange(withdrawal.id, 'processing')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        开始处理
                      </button>
                      <button
                        onClick={() => handleWithdrawalStatusChange(withdrawal.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        完成提现
                      </button>
                      <button
                        onClick={() => {
                          const remark = prompt('请输入拒绝原因:')
                          if (remark) {
                            handleWithdrawalStatusChange(withdrawal.id, 'rejected', remark)
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        拒绝提现
                      </button>
                    </div>
                  )}

                  {withdrawal.status === 'processing' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleWithdrawalStatusChange(withdrawal.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        完成提现
                      </button>
                      <button
                        onClick={() => {
                          const remark = prompt('请输入拒绝原因:')
                          if (remark) {
                            handleWithdrawalStatusChange(withdrawal.id, 'rejected', remark)
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        拒绝提现
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
