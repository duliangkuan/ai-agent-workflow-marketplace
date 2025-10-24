'use client'

interface AdminNavigationProps {
  activeTab: 'products' | 'codes' | 'promotion' | 'password'
  onTabChange: (tab: 'products' | 'codes' | 'promotion' | 'password') => void
  onLogout: () => void
}

export default function AdminNavigation({ activeTab, onTabChange, onLogout }: AdminNavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-gray-900">
              管理员后台
            </h1>
            <div className="flex space-x-6">
              <button
                onClick={() => onTabChange('products')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'products'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                商品管理
              </button>
              <button
                onClick={() => onTabChange('codes')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'codes'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                会员码管理
              </button>
              <button
                onClick={() => onTabChange('promotion')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'promotion'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                推广管理
              </button>
              <button
                onClick={() => onTabChange('password')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                密码管理
              </button>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>
    </nav>
  )
}
