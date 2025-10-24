'use client'

import { useState, useEffect } from 'react'
import ActivationCodeGenerator from './ActivationCodeGenerator'
import ActivationCodeList from './ActivationCodeList'

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

export default function ActivationCodeManagement() {
  const [codes, setCodes] = useState<ActivationCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerator, setShowGenerator] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  })

  useEffect(() => {
    fetchCodes()
  }, [page, filters])

  const fetchCodes = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status })
      })

      const response = await fetch(`/api/admin/activation-codes?${params}`)
      const data = await response.json()

      if (page === 1) {
        setCodes(data.codes)
      } else {
        setCodes(prev => [...prev, ...data.codes])
      }

      setHasMore(data.pagination.page < data.pagination.pages)
    } catch (error) {
      console.error('获取激活码列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSuccess = () => {
    setShowGenerator(false)
    setPage(1)
    fetchCodes()
  }

  const handleFilterChange = (newFilters: { type: string; status: string }) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">会员码管理</h2>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary"
        >
          生成激活码
        </button>
      </div>

      {showGenerator && (
        <ActivationCodeGenerator
          onSuccess={handleGenerateSuccess}
          onCancel={() => setShowGenerator(false)}
        />
      )}

      <ActivationCodeList
        codes={codes}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  )
}
