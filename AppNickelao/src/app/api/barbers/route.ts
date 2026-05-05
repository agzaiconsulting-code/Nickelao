import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public — needed by the booking form before login
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const location = searchParams.get('location') as 'FOZ' | 'MONDONEDO' | null

  const barbers = await prisma.barber.findMany({
    where: { isActive: true, ...(location ? { location } : {}) },
    include: { user: { select: { name: true } } },
    orderBy: { user: { name: 'asc' } },
  })

  return NextResponse.json(
    barbers.map(b => ({ id: b.id, name: b.user.name ?? '—' }))
  )
}
