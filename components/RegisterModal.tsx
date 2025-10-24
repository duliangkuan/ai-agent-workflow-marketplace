'use client'

import { useState } from 'react'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function RegisterModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
  const [showLogin, setShowLogin] = useState(false)

  if (!isOpen) return null

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  const handleSwitchToLogin = () => {
    setShowLogin(true)
  }

  const handleSwitchToRegister = () => {
    setShowLogin(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {showLogin ? '登录账号' : '注册账号'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {showLogin ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={handleSwitchToRegister}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  )
}
