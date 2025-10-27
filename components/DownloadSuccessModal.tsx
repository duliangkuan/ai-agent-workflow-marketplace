'use client'

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

interface DownloadSuccessModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function DownloadSuccessModal({ 
  product, 
  isOpen, 
  onClose 
}: DownloadSuccessModalProps) {
  if (!isOpen || !product) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('链接已复制到剪贴板')
    }).catch(() => {
      alert('复制失败，请手动复制链接')
    })
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        {/* 弹窗头部 */}
        <div className="p-6 border-b">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">下载成功</h3>
          </div>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6">
          <div className="space-y-6">
            {/* 成功信息 */}
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-2">✅</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {product.title} 下载成功！
              </h4>
              <p className="text-gray-600">
                您已成功消耗一个下载额度，现在可以下载相关文件
              </p>
            </div>

            {/* 下载链接 */}
            <div className="space-y-4">
              {/* 源文件下载 */}
              {product.sourceUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      <div>
                        <h5 className="font-medium text-gray-900">源文件压缩包</h5>
                        <p className="text-sm text-gray-600">包含完整的{product.type === 'agent' ? '智能体' : '工作流'}源文件</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={product.sourceUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleCopyLink(product.sourceUrl!)}
                        className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        复制
                      </button>
                      <a
                        href={product.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        打开
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 使用说明下载 */}
              {product.guideUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <h5 className="font-medium text-gray-900">使用说明文件</h5>
                        <p className="text-sm text-gray-600">详细的使用教程和操作指南</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={product.guideUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md"
                      />
                      <button
                        onClick={() => handleCopyLink(product.guideUrl!)}
                        className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        复制
                      </button>
                      <a
                        href={product.guideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        打开
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* 如果没有文件链接 */}
              {!product.sourceUrl && !product.guideUrl && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-800 text-sm">
                      该产品暂无下载文件，请联系管理员
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">下载说明：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>点击"复制"按钮复制链接到剪贴板，然后在浏览器中打开</li>
                    <li>点击"打开"按钮在新标签页中打开链接</li>
                    <li>下载的文件包含完整的{product.type === 'agent' ? '智能体' : '工作流'}资源</li>
                    <li>请仔细阅读使用说明文件，按照步骤进行配置</li>
                    <li>如有问题，请联系客服：15614325230</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 弹窗底部 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="btn-primary px-6 py-2"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
