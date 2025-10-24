'use client'

import { useState } from 'react'

interface SearchAndFilterProps {
  onSearch: (query: string) => void
  onFilter: (type: string) => void
  searchQuery: string
  filterType: string
}

export default function SearchAndFilter({ onSearch, onFilter, searchQuery, filterType }: SearchAndFilterProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearchQuery)
  }

  const handleFilterChange = (type: string) => {
    onFilter(type)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              placeholder="搜索智能体或工作流..."
              className="input pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </form>

        {/* 筛选器 */}
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === ''
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleFilterChange('agent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'agent'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            智能体
          </button>
          <button
            onClick={() => handleFilterChange('workflow')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'workflow'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            工作流
          </button>
        </div>
      </div>
    </div>
  )
}
