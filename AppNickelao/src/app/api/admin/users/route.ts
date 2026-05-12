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
  const q = (searchParams.get('q') ?? '').slice(0, 100)
  const blockedOnly = searchParams.get('blocked') === 'true'

  // Listing blocked users is admin-only
  if (blockedOnly && !['ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // BARBERs can only search (not enumerate all users)
  if (!q && user.role === 'BARBER') {
    return NextResponse.json([])
  }

  const isAdmin = ['ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)

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
      phone: isAdmin,
      email: isAdmin,
      isBlocked: isAdmin,
      blockedReason: isAdmin,
      blockedAt: isAdmin,
    },
    take: 20,
  })

  return NextResponse.json(users)
}
