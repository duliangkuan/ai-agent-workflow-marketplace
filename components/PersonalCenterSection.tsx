'use client'

import { useState, useEffect } from 'react'
import MembershipCard from './MembershipCard'
import ActivationForm from './ActivationForm'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

interface Membership {
  id: string
  type: string
  name: string
  price: number
  features: string[]
  startTime: string
  endTime: string
  remainingDownloads: number
  isUnlimited: boolean
}

interface AccountInfo {
  id: string
  username: string
  email: string
  promotionCode: string
  totalEarnings: number
  availableBalance: number
  totalPromotions: number
  currentMembership?: {
    type: string
    endTime: string
    remainingDownloads: number
  }
}

interface PersonalCenterSectionProps {}

export default function PersonalCenterSection({}: PersonalCenterSectionProps) {
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'subscription' | 'activation'>('subscription')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)

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
          setAccountInfo(data.account)
          if (data.account.currentMembership) {
            // 转换账号会员信息为组件格式
            const membershipInfo = getMembershipTypeInfo(data.account.currentMembership.type)
            setMembership({
              id: 'account-membership',
              type: data.account.currentMembership.type,
              name: membershipInfo.name,
              price: membershipInfo.price,
              features: membershipInfo.features,
              startTime: new Date().toISOString(),
              endTime: data.account.currentMembership.endTime,
              remainingDownloads: data.account.currentMembership.remainingDownloads,
              isUnlimited: membershipInfo.downloads === -1
            })
          }
        } else {
          setIsLoggedIn(false)
          // 回退到会话系统
          fetchMembership()
        }
      } else {
        setIsLoggedIn(false)
        // 回退到会话系统
        fetchMembership()
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      setIsLoggedIn(false)
      // 回退到会话系统
      fetchMembership()
    } finally {
      setLoading(false)
    }
  }

  const fetchMembership = async () => {
    try {
      const response = await fetch('/api/memberships/user')
      const data = await response.json()

      if (data.hasMembership) {
        setMembership(data.membership)
      }
    } catch (error) {
      console.error('获取会员信息失败:', error)
    }
  }

  const handleActivationSuccess = () => {
    // 激活成功后重新获取会员信息
    if (isLoggedIn) {
      checkAuthStatus()
    } else {
      fetchMembership()
    }
    setActiveTab('subscription')
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setShowLogin(false)
    checkAuthStatus()
  }

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true)
    setShowRegister(false)
    checkAuthStatus()
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setIsLoggedIn(false)
      setAccountInfo(null)
      setMembership(null)
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const getMembershipTypeInfo = (type: string) => {
    const types = {
      temporary: {
        name: '临时会员',
        price: 49.8,
        features: ['市场板块任选1个下载', '远程技术答疑'],
        downloads: 1
      },
      regular: {
        name: '普通会员',
        price: 398,
        features: ['30个免费下载额度', '专属远程技术支持', '持续更新模板'],
        downloads: 30
      },
      premium: {
        name: '高级会员',
        price: 998,
        features: ['全场任意下载', '持续更新', '赠变现经验', '24天小白教学课程（价值7000元）'],
        downloads: -1
      },
      super: {
        name: '超级会员',
        price: 3999,
        features: ['含高级会员所有权益', '赠专属售卖网站', '定制客户渠道', '全量资源包', '变现体系陪跑'],
        downloads: -1
      }
    }
    return types[type as keyof typeof types] || types.regular
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  // 如果未登录，显示登录/注册界面
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h2>
          <p className="text-gray-600">登录后即可管理您的会员订阅</p>
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
            <div className="text-gray-400 text-6xl mb-4">👤</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">请先登录</h3>
            <p className="text-gray-600 mb-6">登录后即可管理您的会员订阅和账户信息</p>
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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h2>
        <p className="text-gray-600">管理您的会员订阅和账户信息</p>
      </div>

      {/* 用户信息 */}
      {accountInfo && (
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">欢迎，{accountInfo.username}</h3>
              <p className="text-sm text-gray-600">{accountInfo.email}</p>
              <p className="text-xs text-gray-500">推广码: {accountInfo.promotionCode}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              退出登录
            </button>
          </div>
        </div>
      )}

      {/* 标签页导航 */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'subscription'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            会员订阅
          </button>
          <button
            onClick={() => setActiveTab('activation')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'activation'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            会员码激活
          </button>
        </div>
      </div>

      {/* 会员订阅板块 */}
      {activeTab === 'subscription' && (
        <div className="space-y-8">
          {/* 当前会员状态 */}
          {membership ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">当前会员状态</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  new Date(membership.endTime) > new Date()
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {new Date(membership.endTime) > new Date() ? '有效' : '已过期'}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">会员类型</p>
                    <p className="font-semibold text-gray-900">{membership.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">到期时间</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(membership.endTime).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">剩余下载次数</p>
                    <p className="font-semibold text-gray-900">
                      {membership.isUnlimited ? '无限' : membership.remainingDownloads}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">会员权益</p>
                    <p className="font-semibold text-gray-900">
                      {membership.features.slice(0, 2).join('、')}
                      {membership.features.length > 2 && '...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">您还不是会员</h3>
              <p className="text-gray-600 mb-4">开通会员即可享受更多权益和资源</p>
            </div>
          )}

          {/* 会员套餐 */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">选择会员套餐</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MembershipCard
                type="temporary"
                name="临时会员"
                price={49.8}
                duration="1天"
                downloads="1次"
                features={['市场板块任选1个下载', '远程技术答疑']}
                isRecommended={false}
              />
              <MembershipCard
                type="regular"
                name="普通会员"
                price={398}
                duration="30天"
                downloads="30次"
                features={['30个免费下载额度', '专属远程技术支持', '持续更新模板']}
                isRecommended={false}
              />
              <MembershipCard
                type="premium"
                name="高级会员"
                price={998}
                duration="365天"
                downloads="无限"
                features={['全场任意下载', '持续更新', '赠变现经验', '24天小白教学课程（价值7000元）']}
                isRecommended={true}
              />
              <MembershipCard
                type="super"
                name="超级会员"
                price={3999}
                duration="永久"
                downloads="无限"
                features={['含高级会员所有权益', '赠专属售卖网站', '定制客户渠道', '全量资源包', '变现体系陪跑']}
                isRecommended={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* 会员码激活板块 */}
      {activeTab === 'activation' && (
        <div className="max-w-md mx-auto">
          <ActivationForm onSuccess={handleActivationSuccess} />
        </div>
      )}
    </div>
  )
}