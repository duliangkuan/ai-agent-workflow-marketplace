'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavigation from '@/components/admin/AdminNavigation'
import ProductManagement from '@/components/admin/ProductManagement'
import ActivationCodeManagement from '@/components/admin/ActivationCodeManagement'
import PromotionManagement from '@/components/admin/PromotionManagement'
import PasswordManagement from '@/components/admin/PasswordManagement'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'codes' | 'promotion' | 'password'>('products')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 检查是否有管理员会话
      const response = await fetch('/api/admin/products?page=1&limit=1')
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // 清除管理员会话
    document.cookie = 'admin_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">验证中...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />
      case 'codes':
        return <ActivationCodeManagement />
      case 'promotion':
        return <PromotionManagement />
      case 'password':
        return <PasswordManagement />
      default:
        return <ProductManagement />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  )
}
