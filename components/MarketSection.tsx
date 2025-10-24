'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import SearchAndFilter from './SearchAndFilter'

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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">智能体与工作流市场</h2>
        <p className="text-gray-600">发现高质量的AI工具和解决方案</p>
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
              <ProductCard key={product.id} product={product} />
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
    </div>
  )
}
