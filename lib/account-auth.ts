import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { generateSessionId } from './auth'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getAccountSessionId(): Promise<string | null> {
  const cookieStore = cookies()
  return cookieStore.get('account_session_id')?.value || null
}

export async function setAccountSession(sessionId: string): Promise<void> {
  const cookieStore = cookies()
  cookieStore.set('account_session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function clearAccountSession(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete('account_session_id')
}

export function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function createAccountSession(accountId: string): Promise<string> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天

  // 创建会话记录
  await prisma.session.create({
    data: {
      accountId,
      token,
      expiresAt
    }
  })

  // 设置cookie
  await setAccountSession(token)

  return token
}

export async function getCurrentAccount(): Promise<any> {
  const sessionToken = await getAccountSessionId()
  if (!sessionToken) return null

  // 通过session token查找有效的会话
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { account: true }
  })

  // 检查会话是否有效
  if (!session || session.expiresAt < new Date()) {
    // 会话无效，清除cookie
    await clearAccountSession()
    return null
  }

  return session.account
}

export async function generatePromotionCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'REF'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // 确保推广码唯一
  const existing = await prisma.account.findUnique({
    where: { promotionCode: result }
  })
  
  if (existing) {
    return generatePromotionCode() // 递归生成新的
  }
  
  return result
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}
