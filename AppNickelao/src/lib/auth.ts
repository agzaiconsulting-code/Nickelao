import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const store = await cookies()
  const userId = store.get('uid')?.value
  if (!userId) return null
  return prisma.user.findUnique({ where: { id: userId } })
}
