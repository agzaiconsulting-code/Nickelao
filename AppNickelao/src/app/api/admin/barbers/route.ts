import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const barbers = await prisma.barber.findMany({
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json(
    barbers.map(b => ({
      id: b.id,
      name: b.user.name ?? '',
      location: b.location,
      isActive: b.isActive,
    }))
  )
}
