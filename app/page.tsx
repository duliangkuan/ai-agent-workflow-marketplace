'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import MarketSection from '@/components/MarketSection'
import CustomOrderSection from '@/components/CustomOrderSection'
import PromotionCenterSection from '@/components/PromotionCenterSection'
import PersonalCenterSection from '@/components/PersonalCenterSection'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'market' | 'custom' | 'promotion' | 'personal'>('market')
  const searchParams = useSearchParams()

  useEffect(() => {
    // 检查是否有推广链接参数
    const ref = searchParams.get('ref')
    if (ref) {
      // 将推广码存储到localStorage，供注册时使用
      localStorage.setItem('promotionCode', ref)
    }

    // 检查是否有标签页参数
    const tab = searchParams.get('tab')
    if (tab && ['market', 'custom', 'promotion', 'personal'].includes(tab)) {
      setActiveTab(tab as 'market' | 'custom' | 'promotion' | 'personal')
    }
  }, [searchParams])

  const renderContent = () => {
    switch (activeTab) {
      case 'market':
        return <MarketSection />
      case 'custom':
        return <CustomOrderSection />
      case 'promotion':
        return <PromotionCenterSection />
      case 'personal':
        return <PersonalCenterSection />
      default:
        return <MarketSection />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  )
}
