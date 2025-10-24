// Simple utility function for combining classes
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}

export function generateActivationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getMembershipTypeInfo(type: string) {
  const types = {
    temporary: {
      name: '临时会员',
      price: 49.8,
      duration: 1,
      downloads: 1,
      features: ['市场板块任选1个下载', '远程技术答疑']
    },
    regular: {
      name: '普通会员',
      price: 398,
      duration: 30,
      downloads: 30,
      features: ['30个免费下载额度', '专属远程技术支持', '持续更新模板']
    },
    premium: {
      name: '高级会员',
      price: 998,
      duration: 365,
      downloads: -1, // unlimited
      features: ['全场任意下载', '持续更新', '赠变现经验', '24天小白教学课程（价值7000元）']
    },
    super: {
      name: '超级会员',
      price: 3999,
      duration: -1, // permanent
      downloads: -1, // unlimited
      features: ['含高级会员所有权益', '赠专属售卖网站', '定制客户渠道', '全量资源包', '变现体系陪跑']
    }
  }
  
  return types[type as keyof typeof types] || types.temporary
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}
