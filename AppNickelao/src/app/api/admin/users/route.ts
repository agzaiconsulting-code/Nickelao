import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const blockedOnly = searchParams.get('blocked') === 'true'

  const users = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
      isBlocked: blockedOnly ? true : undefined,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      isBlocked: true,
      blockedReason: true,
      blockedAt: true,
    },
    ...(q ? { take: 20 } : {}),
  })

  return NextResponse.json(users)
}
