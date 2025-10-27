'use client'

import { useState } from 'react'

interface MembershipCardProps {
  type: string
  name: string
  price: number
  duration: string
  downloads: string
  features: string[]
  isRecommended: boolean
}

export default function MembershipCard({ type, name, price, duration, downloads, features, isRecommended }: MembershipCardProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentTab, setPaymentTab] = useState<'wechat' | 'alipay'>('wechat') // 默认显示微信支付

  const handleSubscribe = () => {
    setShowPaymentModal(true)
  }

  return (
    <>
      <div className={`card relative ${isRecommended ? 'ring-2 ring-primary-500' : ''}`}>
        {isRecommended && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              推荐
            </span>
          </div>
        )}

        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-primary-600">¥{price}</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>有效期：{duration}</p>
            <p>下载次数：{downloads}</p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isRecommended
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          订阅
        </button>
      </div>

      {/* 支付弹窗 */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw] mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              支付 {name}
            </h3>
            
            <div className="text-center mb-6">
              <p className="text-2xl font-bold text-primary-600 mb-2">¥{price}</p>
              <p className="text-gray-600">有效期：{duration}</p>
            </div>

            {/* 支付方式标签页 */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPaymentTab('wechat')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  paymentTab === 'wechat'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                微信支付
              </button>
              <button
                onClick={() => setPaymentTab('alipay')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  paymentTab === 'alipay'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                支付宝支付
              </button>
            </div>

            {/* 收款码显示区域 */}
            <div className="mb-6">
              {paymentTab === 'wechat' ? (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                    <p className="text-green-700 text-sm font-medium mb-3">推荐使用微信支付</p>
                    <div className="bg-white rounded-lg p-4 h-64 flex items-center justify-center">
                      <img 
                        src="/images/wechat-qr.png" 
                        alt="微信收款码" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextElement) {
                            nextElement.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="text-gray-400 text-sm hidden flex-col items-center justify-center">
                        <div className="text-4xl mb-2">📱</div>
                        <div>微信收款码</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                    <p className="text-blue-700 text-sm font-medium mb-3">推荐使用支付宝</p>
                    <p className="text-blue-600 text-xs mb-3">支持信用卡|花呗付款</p>
                    <div className="bg-white rounded-lg p-4 h-64 flex items-center justify-center">
                      <img 
                        src="/images/alipay-qr.png" 
                        alt="支付宝收款码" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextElement) {
                            nextElement.style.display = 'flex'
                          }
                        }}
                      />
                      <div className="text-gray-400 text-sm hidden flex-col items-center justify-center">
                        <div className="text-4xl mb-2">💳</div>
                        <div>支付宝收款码</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm text-center">
                <strong>扫码支付后添加专属客服 15614325230 领取会员激活码</strong>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  // 这里可以添加复制客服微信号的功能
                  navigator.clipboard.writeText('15614325230')
                  alert('客服微信号已复制到剪贴板')
                }}
                className="btn-primary flex-1"
              >
                复制客服微信
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
