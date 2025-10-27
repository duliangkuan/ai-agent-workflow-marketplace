'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  title: string
  description: string
  type: string
  videoUrl?: string
  sourceUrl?: string
  guideUrl?: string
  purchaseCount: number
  createdAt: string
  _count: {
    downloadRecords: number
    favorites: number
  }
}

interface DownloadConfirmationModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (product: Product) => void
  userMembership: {
    type: string
    remainingDownloads: number
    totalDownloads: number
  } | null
}

export default function DownloadConfirmationModal({ 
  product, 
  isOpen, 
  onClose, 
  onConfirm,
  userMembership
}: DownloadConfirmationModalProps) {
  const router = useRouter()

  if (!isOpen || !product) return null

  const handleConfirm = () => {
    onConfirm(product)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const canDownload = userMembership && (
    userMembership.type === 'premium' || 
    userMembership.type === 'super' || 
    userMembership.remainingDownloads > 0
  )

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        {/* 弹窗头部 */}
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">确认下载</h3>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6">
          <div className="space-y-4">
            {/* 产品信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{product.title}</h4>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.type === 'agent' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {product.type === 'agent' ? '智能体' : '工作流'}
                </span>
                <span className="text-sm text-gray-500">
                  {product.purchaseCount} 次下载
                </span>
              </div>
            </div>

            {/* 下载额度信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-blue-800">下载额度</span>
              </div>
              <div className="text-sm text-blue-700">
                {userMembership ? (
                  userMembership.type === 'premium' || userMembership.type === 'super' ? (
                    <span>您拥有无限下载额度</span>
                  ) : (
                    <span>当前剩余：{userMembership.remainingDownloads}/{userMembership.totalDownloads}</span>
                  )
                ) : (
                  <span>您暂无下载额度</span>
                )}
              </div>
            </div>

            {/* 确认信息 */}
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                是否消耗一个下载额度下载此{product.type === 'agent' ? '智能体' : '工作流'}？
              </p>
              <p className="text-sm text-gray-500">
                下载后将获得源文件压缩包和使用说明文件
              </p>
            </div>
          </div>
        </div>

        {/* 弹窗底部 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            {canDownload ? (
              <button
                onClick={handleConfirm}
                className="flex-1 btn-primary"
              >
                确认下载
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose()
                  router.push('/?tab=personal')
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                开通会员
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
