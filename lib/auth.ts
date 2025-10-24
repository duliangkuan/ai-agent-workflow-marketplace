import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function getSessionId(): Promise<string> {
  const cookieStore = cookies()
  let sessionId = cookieStore.get('session_id')?.value

  if (!sessionId) {
    sessionId = generateSessionId()
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
    
    // Create user record
    await prisma.user.create({
      data: {
        sessionId,
      },
    })
  }

  return sessionId
}

export async function getUserId(): Promise<string | null> {
  const sessionId = await getSessionId()
  const user = await prisma.user.findUnique({
    where: { sessionId },
  })
  return user?.id || null
}

export async function getAdminSessionId(): Promise<string | null> {
  const cookieStore = cookies()
  return cookieStore.get('admin_session_id')?.value || null
}

export async function setAdminSession(sessionId: string): Promise<void> {
  const cookieStore = cookies()
  cookieStore.set('admin_session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
  })
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete('admin_session_id')
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
