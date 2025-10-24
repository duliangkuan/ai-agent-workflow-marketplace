'use client'

import { useState } from 'react'
import PromotionStats from './PromotionStats'
import PromotionLink from './PromotionLink'
import PromotedUsers from './PromotedUsers'
import CommissionRecords from './CommissionRecords'
import WithdrawalSection from './WithdrawalSection'

interface PromotionData {
  account: {
    id: string
    username: string
    promotionCode: string
    totalEarnings: number
    availableBalance: number
    totalPromotions: number
  }
  promotionLink: string
  promotedUsers: Array<{
    id: string
    username: string
    email: string
    joinedAt: string
    totalPurchaseAmount: number
    totalCommission: number
  }>
  recentCommissions: Array<{
    id: string
    amount: number
    membershipType: string
    membershipPrice: number
    rate: number
    createdAt: string
  }>
  monthlyStats: {
    totalAmount: number
    totalCount: number
  }
  nextSettlementDate: string
}

interface PromotionDashboardProps {
  data: PromotionData
  onDataUpdate: () => void
}

export default function PromotionDashboard({ data, onDataUpdate }: PromotionDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'commissions' | 'withdraw'>('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <PromotionStats data={data} />
            <PromotionLink promotionLink={data.promotionLink} promotionCode={data.account.promotionCode} />
          </div>
        )
      case 'users':
        return <PromotedUsers users={data.promotedUsers} />
      case 'commissions':
        return <CommissionRecords commissions={data.recentCommissions} />
      case 'withdraw':
        return <WithdrawalSection account={data.account} onDataUpdate={onDataUpdate} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            概览
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            推广用户
          </button>
          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'commissions'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            分润记录
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            提现管理
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {renderContent()}
    </div>
  )
}
