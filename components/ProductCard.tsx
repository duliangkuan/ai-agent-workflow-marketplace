'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import RegisterModal from './RegisterModal'

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

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(data.success)
      } else {
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      setIsLoggedIn(false)
    }
  }

  const handlePlayVideo = () => {
    setIsVideoPlaying(!isVideoPlaying)
  }

  const handleFavorite = async () => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          action: isFavorited ? 'remove' : 'add'
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsFavorited(!isFavorited)
      }
    } catch (error) {
      console.error('操作收藏失败:', error)
    }
  }

  const handlePurchase = () => {
    if (isLoggedIn) {
      // 已登录用户跳转到个人中心的会员订阅板块
      router.push('/?tab=personal')
    } else {
      // 未登录用户显示注册弹窗
      setShowRegisterModal(true)
    }
  }

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true)
    // 注册成功后跳转到个人中心
    router.push('/?tab=personal')
  }

  return (
    <>
      <div className="card hover:shadow-md transition-shadow duration-200">
      {/* 视频预览区域 */}
      <div className="relative mb-4">
        {product.videoUrl ? (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {isVideoPlaying ? (
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
                  className="flex items-center justify-center w-16 h-16 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                >
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-gray-400 text-4xl">📹</div>
          </div>
        )}

        {/* 收藏按钮 */}
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
        >
          <svg
            className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* 类型标签 */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            product.type === 'agent' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {product.type === 'agent' ? '智能体' : '工作流'}
          </span>
        </div>
      </div>

      {/* 产品信息 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-3">
          {product.description}
        </p>

        {/* 统计信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              {product.purchaseCount} 次下载
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {product._count.favorites} 收藏
            </span>
          </div>
        </div>

        {/* 购买按钮 */}
        <button
          onClick={handlePurchase}
          className="w-full btn-primary"
        >
          购买
        </button>
      </div>
    </div>

    {/* 注册弹窗 */}
    <RegisterModal
      isOpen={showRegisterModal}
      onClose={() => setShowRegisterModal(false)}
      onSuccess={handleRegisterSuccess}
    />
    </>
  )
}
