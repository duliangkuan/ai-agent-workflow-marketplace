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

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onDownload: (product: Product) => void
}

export default function ProductDetailModal({ 
  product, 
  isOpen, 
  onClose, 
  onDownload 
}: ProductDetailModalProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const router = useRouter()

  if (!isOpen || !product) return null

  const handlePlayVideo = () => {
    setIsVideoPlaying(!isVideoPlaying)
  }

  const handleDownload = () => {
    onDownload(product)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
            <div className="flex items-center space-x-4 mt-2">
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 视频播放区域 */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">效果展示</h4>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {product.videoUrl ? (
                  isVideoPlaying ? (
                    <video
                      src={product.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      onEnded={() => setIsVideoPlaying(false)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <button
                        onClick={handlePlayVideo}
                        className="flex items-center justify-center w-20 h-20 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                      >
                        <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5-8-5z" />
                        </svg>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-400 text-6xl">📹</div>
                  </div>
                )}
              </div>
            </div>

            {/* 产品信息 */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">产品描述</h4>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* 统计信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">产品统计</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span className="text-gray-600">{product.purchaseCount} 次下载</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-gray-600">{product._count.favorites} 收藏</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 弹窗底部 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              点击下载按钮将消耗一个下载额度
            </div>
            <button
              onClick={handleDownload}
              className="btn-primary px-6 py-2"
            >
              下载
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
