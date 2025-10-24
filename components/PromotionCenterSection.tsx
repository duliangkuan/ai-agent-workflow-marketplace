'use client'

import { useState, useEffect } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import PromotionDashboard from './PromotionDashboard'

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

export default function PromotionCenterSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [promotionData, setPromotionData] = useState<PromotionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsLoggedIn(true)
          fetchPromotionData()
        } else {
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      setIsLoggedIn(false)
    } finally {
      setLoading(false)
    }
  }

  const fetchPromotionData = async () => {
    try {
      const response = await fetch('/api/promotion/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPromotionData(data.data)
        }
      }
    } catch (error) {
      console.error('获取推广数据失败:', error)
    }
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setShowLogin(false)
    fetchPromotionData()
  }

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true)
    setShowRegister(false)
    fetchPromotionData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">推广中心</h2>
          <p className="text-gray-600">登录后即可开始推广赚取分润</p>
        </div>

        {showLogin ? (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => {
              setShowLogin(false)
              setShowRegister(true)
            }}
          />
        ) : showRegister ? (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => {
              setShowRegister(false)
              setShowLogin(true)
            }}
          />
        ) : (
          <div className="card text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">开始推广赚取分润</h3>
            <p className="text-gray-600 mb-6">注册账号后即可获得专属推广链接，推广用户购买会员即可获得分润</p>
            <div className="space-y-3">
              <button
                onClick={() => setShowRegister(true)}
                className="w-full btn-primary"
              >
                立即注册
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="w-full btn-secondary"
              >
                已有账号，立即登录
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">推广中心</h2>
        <p className="text-gray-600">管理您的推广业务，查看分润收益</p>
      </div>

      {promotionData && (
        <PromotionDashboard
          data={promotionData}
          onDataUpdate={fetchPromotionData}
        />
      )}
    </div>
  )
}
