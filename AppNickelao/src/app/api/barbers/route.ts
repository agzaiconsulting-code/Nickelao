import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const location = searchParams.get('location') as 'FOZ' | 'MONDONEDO' | null

  const barbers = await prisma.barber.findMany({
    where: {
      isActive: true,
      ...(location ? { location } : {}),
    },
    include: {
      user: { select: { id: true, name: true, lastName: true, avatarUrl: true } },
    },
  })

  return NextResponse.json(barbers)
}
