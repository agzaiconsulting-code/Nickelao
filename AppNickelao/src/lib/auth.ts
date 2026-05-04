import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const store = await cookies()
  const userId = store.get('uid')?.value
  if (!userId) return null
  try {
    return await prisma.user.findUnique({ where: { id: userId } })
  } catch {
    return null
  }
}
