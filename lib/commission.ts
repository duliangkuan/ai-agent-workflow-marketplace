import { prisma } from './prisma'

export function getCommissionRate(membershipType: string): number {
  const rates = {
    regular: 0.05,    // 普通用户 5%
    premium: 0.10,    // 普通会员 10%
    super: 0.30       // 高级/超级会员 30%
  }
  
  return rates[membershipType as keyof typeof rates] || 0.05
}

export function getMembershipPrice(membershipType: string): number {
  const prices = {
    temporary: 49.8,
    regular: 398,
    premium: 998,
    super: 3999
  }
  
  return prices[membershipType as keyof typeof prices] || 0
}

export function calculateCommission(membershipType: string, promoterMembershipType: string): number {
  const price = getMembershipPrice(membershipType)
  const rate = getCommissionRate(promoterMembershipType)
  return price * rate
}

export async function processCommission(
  promoterId: string,
  accountId: string,
  membershipType: string,
  membershipId?: string,
  activationCodeId?: string
): Promise<void> {
  try {
    // 获取推广员信息
    const promoter = await prisma.account.findUnique({
      where: { id: promoterId }
    })
    
    if (!promoter) {
      console.error('推广员不存在:', promoterId)
      return
    }
    
    // 确定推广员的会员等级
    const promoterMembership = await prisma.accountMembership.findFirst({
      where: {
        accountId: promoterId,
        status: 'active',
        endTime: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const promoterLevel = promoterMembership?.type || 'regular'
    
    // 计算分润
    const commission = calculateCommission(membershipType, promoterLevel)
    
    if (commission <= 0) {
      console.log('分润金额为0，跳过记录')
      return
    }
    
    // 记录分润
    await prisma.commissionRecord.create({
      data: {
        promoterId,
        accountId,
        membershipId,
        activationCodeId,
        amount: commission,
        rate: getCommissionRate(promoterLevel),
        membershipType,
        membershipPrice: getMembershipPrice(membershipType),
        status: 'confirmed',
        confirmedAt: new Date()
      }
    })
    
    // 更新推广员余额
    await prisma.account.update({
      where: { id: promoterId },
      data: {
        totalEarnings: { increment: commission },
        availableBalance: { increment: commission }
      }
    })
    
    // 更新推广关系
    await prisma.promotionRelation.updateMany({
      where: {
        promoterId,
        accountId
      },
      data: {
        totalPurchaseAmount: { increment: getMembershipPrice(membershipType) },
        totalCommission: { increment: commission }
      }
    })
    
    console.log(`分润计算完成: 推广员${promoterId}, 金额${commission}`)
    
  } catch (error) {
    console.error('分润计算失败:', error)
  }
}

export function getNextSettlementDate(): Date {
  const now = new Date()
  const day = now.getDate()
  
  if (day <= 15) {
    // 本月15号
    return new Date(now.getFullYear(), now.getMonth(), 15)
  } else if (day <= 30) {
    // 本月30号
    return new Date(now.getFullYear(), now.getMonth(), 30)
  } else {
    // 下月15号
    return new Date(now.getFullYear(), now.getMonth() + 1, 15)
  }
}

export function formatSettlementDate(date: Date): string {
  // 确保date是Date对象
  const dateObj = date instanceof Date ? date : new Date(date)
  return dateObj.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
