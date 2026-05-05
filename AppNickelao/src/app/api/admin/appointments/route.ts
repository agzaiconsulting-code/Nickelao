import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')     // YYYY-MM-DD
  const location = searchParams.get('location') // FOZ | MONDONEDO

  if (!dateStr || !location) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`)
  const dayEnd   = new Date(`${dateStr}T23:59:59.999Z`)

  const barbers = await prisma.barber.findMany({
    where: { location: location as 'FOZ' | 'MONDONEDO', isActive: true },
    include: { user: { select: { name: true } } },
  })

  const barberIds = barbers.map(b => b.id)

  const [appointments, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId: { in: barberIds },
        startTime: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' },
      },
      include: {
        client: { select: { name: true, phone: true } },
        barber: { include: { user: { select: { name: true } } } },
        service: { select: { name: true, duration: true } },
      },
      orderBy: { startTime: 'asc' },
    }),
    prisma.unavailabilityBlock.findMany({
      where: { barberId: { in: barberIds }, startTime: { gte: dayStart, lte: dayEnd } },
      select: { id: true, barberId: true, startTime: true, endTime: true, reason: true },
    }),
  ])

  return NextResponse.json({
    barbers: barbers.map(b => ({ id: b.id, name: b.user.name ?? '—' })),
    appointments: appointments.map(a => ({
      id: a.id,
      barberId: a.barberId,
      startTime: a.startTime.toISOString(),
      endTime: a.endTime.toISOString(),
      client: { name: a.client.name ?? 'Cliente', phone: a.client.phone ?? '' },
      barber: a.barber.user.name ?? '—',
      service: { name: a.service.name, duration: a.service.duration },
    })),
    blocks: blocks.map(bl => ({
      id: bl.id,
      barberId: bl.barberId,
      startTime: bl.startTime.toISOString(),
      endTime: bl.endTime.toISOString(),
      reason: bl.reason,
    })),
  })
}
