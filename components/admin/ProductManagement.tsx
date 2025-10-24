'use client'

import { useState, useEffect } from 'react'
import ProductForm from './ProductForm'
import ProductList from './ProductList'

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

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [page])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/admin/products?page=${page}&limit=10`)
      const data = await response.json()

      if (page === 1) {
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

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setProducts(products.filter(p => p.id !== id))
        alert('产品删除成功')
      } else {
        alert(data.error || '删除失败')
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      alert('删除失败，请稍后重试')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingProduct(null)
    setPage(1)
    fetchProducts()
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  if (showForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false)
          setEditingProduct(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">商品管理</h2>
        <button
          onClick={handleCreateProduct}
          className="btn-primary"
        >
          添加商品
        </button>
      </div>

      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      ) : (
        <>
          <ProductList
            products={products}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />

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
