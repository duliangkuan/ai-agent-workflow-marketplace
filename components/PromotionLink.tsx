'use client'

import { useState } from 'react'

interface PromotionLinkProps {
  promotionLink: string
  promotionCode: string
}

export default function PromotionLink({ promotionLink, promotionCode }: PromotionLinkProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(promotionLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promotionCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">推广链接</h3>
      
      <div className="space-y-4">
        {/* 推广链接 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            您的推广链接
          </label>
          <div className="flex">
            <input
              type="text"
              value={promotionLink}
              readOnly
              className="input rounded-r-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">用户通过此链接注册后，将自动成为您的推广用户</p>
        </div>

        {/* 推广码 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            您的推广码
          </label>
          <div className="flex">
            <input
              type="text"
              value={promotionCode}
              readOnly
              className="input rounded-r-none font-mono"
            />
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 transition-colors"
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">推广码可用于其他推广方式</p>
        </div>

        {/* 推广方式说明 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">推广方式</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 分享推广链接到社交媒体</li>
            <li>• 在论坛、群聊中分享链接</li>
            <li>• 制作二维码进行线下推广</li>
            <li>• 通过推广码进行口头推荐</li>
          </ul>
        </div>

        {/* 推广收益说明 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">推广收益</h4>
          <p className="text-sm text-green-800">
            当用户通过您的推广链接注册并购买会员时，您将自动获得相应比例的分润。
            分润将在用户激活会员码时立即计算并到账。
          </p>
        </div>
      </div>
    </div>
  )
}
