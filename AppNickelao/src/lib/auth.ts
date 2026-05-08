import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionToken =
    cookieStore.get('next-auth.session-token')?.value ??
    cookieStore.get('__Secure-next-auth.session-token')?.value
  if (!sessionToken) return null
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    })
    if (!session || session.expires < new Date()) return null
    return session.user
  } catch {
    return null
  }
}

export async function getSessionUser() {
  return getCurrentUser()
}
