'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import SearchAndFilter from './SearchAndFilter'
import ProductDetailModal from './ProductDetailModal'
import DownloadConfirmationModal from './DownloadConfirmationModal'
import DownloadSuccessModal from './DownloadSuccessModal'

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

interface MarketSectionProps {}

export default function MarketSection({}: MarketSectionProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [userMembership, setUserMembership] = useState<{
    type: string
    remainingDownloads: number
    totalDownloads: number
  } | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)
  const [showDownloadConfirmation, setShowDownloadConfirmation] = useState(false)
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false)

  const fetchUserMembership = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.account.currentMembership) {
          const membership = data.account.currentMembership
          
          // 根据会员类型计算总下载次数
          let totalDownloads = 0
          switch (membership.type) {
            case 'temporary':
              totalDownloads = 1
              break
            case 'regular':
              totalDownloads = 30
              break
            case 'premium':
            case 'super':
              totalDownloads = -1 // 无限
              break
            default:
              totalDownloads = 0
          }
          
          setUserMembership({
            type: membership.type,
            remainingDownloads: membership.remainingDownloads,
            totalDownloads: totalDownloads
          })
        } else {
          // 非会员用户
          setUserMembership({
            type: 'none',
            remainingDownloads: 0,
            totalDownloads: 0
          })
        }
      } else {
        // 未登录用户
        setUserMembership({
          type: 'none',
          remainingDownloads: 0,
          totalDownloads: 0
        })
      }
    } catch (error) {
      console.error('获取用户会员信息失败:', error)
      setUserMembership({
        type: 'none',
        remainingDownloads: 0,
        totalDownloads: 0
      })
    }
  }

  const fetchProducts = async (pageNum: number = 1, search: string = '', type: string = '') => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        ...(search && { search }),
        ...(type && { type })
      })

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (pageNum === 1) {
        setProducts(data.products)
      } else {
        setProducts(prev => [...prev, ...data.products])
      }

      setHasMore(data.pagination.page < data.pagination.pages)
    } catch (error) {
      console.error('获取产品列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserMembership()
  }, [])

  useEffect(() => {
    fetchProducts(1, searchQuery, filterType)
  }, [searchQuery, filterType])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchProducts(nextPage, searchQuery, filterType)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handleFilter = (type: string) => {
    setFilterType(type)
    setPage(1)
  }

  const handleCardClick = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const handleDownload = (product: Product) => {
    setSelectedProduct(product)
    setShowDownloadConfirmation(true)
  }

  const handleConfirmDownload = async (product: Product) => {
    try {
      const response = await fetch('/api/downloads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setShowDownloadConfirmation(false)
        setShowProductDetail(false)
        setShowDownloadSuccess(true)
        // 刷新用户会员信息
        fetchUserMembership()
      } else {
        alert(data.error || '下载失败')
      }
    } catch (error) {
      console.error('下载失败:', error)
      alert('下载失败，请稍后重试')
    }
  }

  const handleCloseModals = () => {
    setShowProductDetail(false)
    setShowDownloadConfirmation(false)
    setShowDownloadSuccess(false)
    setSelectedProduct(null)
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center relative">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">智能体与工作流市场</h2>
        <p className="text-gray-600">发现高质量的AI工具和解决方案</p>
        
        {/* 下载额度显示 */}
        <div className="absolute top-0 right-0">
          <div className="bg-white rounded-lg shadow-md px-4 py-2 border">
            <div className="text-sm text-gray-600">下载额度</div>
            <div className="text-lg font-semibold text-primary-600">
              {userMembership ? (
                userMembership.type === 'premium' || userMembership.type === 'super' ? (
                  <span className="text-green-600">无限</span>
                ) : (
                  `${userMembership.remainingDownloads}/${userMembership.totalDownloads}`
                )
              ) : (
                '0/0'
              )}
            </div>
          </div>
        </div>
      </div>

      <SearchAndFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        searchQuery={searchQuery}
        filterType={filterType}
      />

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无产品</h3>
          <p className="text-gray-600">请尝试调整搜索条件或筛选器</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onCardClick={handleCardClick}
                onDownload={handleDownload}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '加载中...' : '加载更多'}
              </button>
            </div>
          )}
        </>
      )}
      
      {/* 产品详情弹窗 */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductDetail}
        onClose={handleCloseModals}
        onDownload={handleDownload}
      />

      {/* 下载确认弹窗 */}
      <DownloadConfirmationModal
        product={selectedProduct}
        isOpen={showDownloadConfirmation}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDownload}
        userMembership={userMembership}
      />

      {/* 下载成功弹窗 */}
      <DownloadSuccessModal
        product={selectedProduct}
        isOpen={showDownloadSuccess}
        onClose={handleCloseModals}
      />
    </div>
  )
}
