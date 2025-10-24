'use client'

interface ActivationCode {
  id: string
  code: string
  type: string
  isActivated: boolean
  activatedAt?: string
  expiresAt: string
  usageCount: number
  createdAt: string
  logs: Array<{
    id: string
    action: string
    timestamp: string
    details?: string
  }>
}

interface ActivationCodeListProps {
  codes: ActivationCode[]
  loading: boolean
  filters: { type: string; status: string }
  onFilterChange: (filters: { type: string; status: string }) => void
  hasMore: boolean
  onLoadMore: () => void
}

export default function ActivationCodeList({ 
  codes, 
  loading, 
  filters, 
  onFilterChange, 
  hasMore, 
  onLoadMore 
}: ActivationCodeListProps) {
  const getMembershipTypeName = (type: string) => {
    const types = {
      temporary: '临时会员',
      regular: '普通会员',
      premium: '高级会员',
      super: '超级会员'
    }
    return types[type as keyof typeof types] || type
  }

  const getStatusBadge = (code: ActivationCode) => {
    const now = new Date()
    const expiresAt = new Date(code.expiresAt)
    
    if (code.isActivated) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">已激活</span>
    } else if (expiresAt < now) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">已过期</span>
    } else {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">未激活</span>
    }
  }

  if (loading && codes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 筛选器 */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">会员类型</label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="input"
            >
              <option value="">全部类型</option>
              <option value="temporary">临时会员</option>
              <option value="regular">普通会员</option>
              <option value="premium">高级会员</option>
              <option value="super">超级会员</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">激活状态</label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">全部状态</option>
              <option value="unactivated">未激活</option>
              <option value="activated">已激活</option>
            </select>
          </div>
        </div>
      </div>

      {/* 激活码列表 */}
      {codes.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔑</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无激活码</h3>
          <p className="text-gray-600">点击"生成激活码"按钮开始创建</p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    激活码
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    使用次数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    过期时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    激活时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    生成时间
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {code.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getMembershipTypeName(code.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(code)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {code.usageCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(code.expiresAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {code.activatedAt ? new Date(code.activatedAt).toLocaleDateString('zh-CN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(code.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="text-center py-4 border-t border-gray-200">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
