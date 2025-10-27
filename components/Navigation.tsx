'use client'

import { useState } from 'react'

interface NavigationProps {
  activeTab: 'market' | 'custom' | 'promotion' | 'personal'
  onTabChange: (tab: 'market' | 'custom' | 'promotion' | 'personal') => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdminLogin = async () => {
    if (!adminPassword) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      })

      const data = await response.json()

      if (data.success) {
        // 跳转到管理员后台
        window.location.href = '/admin'
      } else {
        alert(data.error || '登录失败')
      }
    } catch (error) {
      console.error('管理员登录失败:', error)
      alert('登录失败，请稍后重试')
    } finally {
      setIsLoading(false)
      setShowAdminLogin(false)
      setAdminPassword('')
    }
  }

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">
                Workflow智能工坊
              </h1>
              <div className="flex space-x-6">
                <button
                  onClick={() => onTabChange('market')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'market'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  市场
                </button>
                <button
                  onClick={() => onTabChange('custom')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'custom'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  需求定制
                </button>
                <button
                  onClick={() => onTabChange('promotion')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'promotion'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  推广中心
                </button>
                <button
                  onClick={() => onTabChange('personal')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'personal'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  个人中心
                </button>
              </div>
            </div>
            
            {/* 隐藏的管理员入口 */}
            <button
              onClick={() => setShowAdminLogin(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="管理员入口"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* 管理员登录弹窗 */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              管理员登录
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  管理员密码
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="input"
                  placeholder="请输入管理员密码"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAdminLogin}
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? '登录中...' : '登录'}
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false)
                    setAdminPassword('')
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
