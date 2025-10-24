'use client'

interface PromotionData {
  account: {
    id: string
    username: string
    promotionCode: string
    totalEarnings: number
    availableBalance: number
    totalPromotions: number
  }
  monthlyStats: {
    totalAmount: number
    totalCount: number
  }
  nextSettlementDate: string
}

interface PromotionStatsProps {
  data: PromotionData
}

export default function PromotionStats({ data }: PromotionStatsProps) {
  const getMembershipLevel = (): string => {
    // 这里可以根据用户的会员等级来确定分润比例
    // 暂时返回普通用户
    return '普通用户'
  }

  const getCommissionRate = (): number => {
    // 根据用户会员等级返回分润比例
    return 0.05 // 5%
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 累计收益 */}
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">累计收益</p>
            <p className="text-2xl font-bold text-gray-900">¥{data.account.totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 可提现余额 */}
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">可提现余额</p>
            <p className="text-2xl font-bold text-gray-900">¥{data.account.availableBalance.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 推广人数 */}
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">推广人数</p>
            <p className="text-2xl font-bold text-gray-900">{data.account.totalPromotions}</p>
          </div>
        </div>
      </div>

      {/* 本月分润 */}
      <div className="card">
        <div className="flex items-center">
          <div className="p-3 bg-orange-100 rounded-lg">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">本月分润</p>
            <p className="text-2xl font-bold text-gray-900">¥{data.monthlyStats.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 推广员信息 */}
      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">推广员信息</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">推广员等级</p>
            <p className="font-medium text-gray-900">{getMembershipLevel()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">分润比例</p>
            <p className="font-medium text-gray-900">{(getCommissionRate() * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">推广码</p>
            <p className="font-medium text-gray-900 font-mono">{data.account.promotionCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">下次结算</p>
            <p className="font-medium text-gray-900">{data.nextSettlementDate}</p>
          </div>
        </div>
      </div>

      {/* 分润规则说明 */}
      <div className="card md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">分润规则</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">普通用户推广员</span>
            <span className="font-medium text-gray-900">5% 分润</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">普通会员推广员</span>
            <span className="font-medium text-gray-900">10% 分润</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">高级会员推广员</span>
            <span className="font-medium text-gray-900">30% 分润</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>结算时间：</strong>每月15号和30号自动结算，结算后余额清零，可申请提现
          </p>
        </div>
      </div>
    </div>
  )
}
