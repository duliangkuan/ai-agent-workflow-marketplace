'use client'

interface CommissionRecord {
  id: string
  amount: number
  membershipType: string
  membershipPrice: number
  rate: number
  createdAt: string
}

interface CommissionRecordsProps {
  commissions: CommissionRecord[]
}

export default function CommissionRecords({ commissions }: CommissionRecordsProps) {
  const getMembershipTypeName = (type: string) => {
    const types = {
      temporary: '临时会员',
      regular: '普通会员',
      premium: '高级会员',
      super: '超级会员'
    }
    return types[type as keyof typeof types] || type
  }

  if (commissions.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无分润记录</h3>
        <p className="text-gray-600">当推广用户购买会员时，分润记录将显示在这里</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">分润记录</h3>
      
      <div className="space-y-4">
        {commissions.map((commission) => (
          <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {getMembershipTypeName(commission.membershipType)} 分润
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(commission.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">
                +¥{commission.amount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">
                {commission.membershipPrice.toFixed(2)} × {(commission.rate * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
