import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  try {
    return await prisma.user.findUnique({ where: { id: session.user.id } })
  } catch {
    return null
  }
}

export async function getSessionUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}
