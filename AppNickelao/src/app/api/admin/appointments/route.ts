import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')
  const location = searchParams.get('location')

  if (!dateStr || !location) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const dayStart = new Date(`${dateStr}T00:00:00.000Z`)
  const dayEnd   = new Date(`${dateStr}T23:59:59.999Z`)

  if (isNaN(dayStart.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const [user, barbers] = await Promise.all([
    getCurrentUser(),
    prisma.barber.findMany({
      where: { location: location as 'FOZ' | 'MONDONEDO', isActive: true },
      select: { id: true, user: { select: { name: true } } },
    }),
  ])

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const isAdmin = ['ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)
  const barberIds = barbers.map(b => b.id)
  const nameById  = Object.fromEntries(barbers.map(b => [b.id, b.user.name ?? '—']))

  const [appointments, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        barberId: { in: barberIds },
        startTime: { gte: dayStart, lte: dayEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        barberId: true,
        startTime: true,
        endTime: true,
        autoAssigned: true,
        client: { select: { name: true, phone: true } },
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
      client: {
        name: a.client.name ?? 'Cliente',
        ...(isAdmin && { phone: a.client.phone ?? '' }),
      },
      barber: nameById[a.barberId] ?? '—',
      service: { name: a.service.name, duration: a.service.duration },
      autoAssigned: a.autoAssigned,
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
