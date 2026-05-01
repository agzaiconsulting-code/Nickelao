import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { barber: true },
  })
  if (!fullUser?.barber) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 })

  const start = new Date(`${date}T00:00:00`)
  const end = new Date(`${date}T23:59:59`)

  const [appointments, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId: fullUser.barber.id,
        startTime: { gte: start, lte: end },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        client: { select: { name: true, lastName: true, phone: true, avatarUrl: true } },
        service: { select: { name: true, duration: true, price: true, category: true } },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.unavailabilityBlock.findMany({
      where: { barberId: fullUser.barber.id, startTime: { gte: start, lte: end } },
      orderBy: { startTime: 'asc' },
    }),
  ])

  return NextResponse.json({ appointments, blocks })
}
