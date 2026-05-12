import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, getIp } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  if (!rateLimit(getIp(req), 30, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as { clientId?: string; barberId?: string; serviceId?: string; startTime?: string }
  const { clientId, barberId, serviceId, startTime } = body

  if (!clientId || !barberId || !serviceId || !startTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const start = new Date(startTime)
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Invalid startTime' }, { status: 400 })
  }

  const [client, service] = await Promise.all([
    prisma.user.findUnique({ where: { id: clientId }, select: { id: true, role: true } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
  ])

  if (!client || client.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  if (!service.isActive) return NextResponse.json({ error: 'Service unavailable' }, { status: 400 })

  const end = new Date(start.getTime() + service.duration * 60 * 1000)

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      const barber = await tx.barber.findUnique({ where: { id: barberId } })
      if (!barber || !barber.isActive) throw Object.assign(new Error('barber_unavailable'), { code: 400 })

      // BARBERs can only book on their own calendar
      if (user.role === 'BARBER') {
        const ownBarber = await tx.barber.findUnique({ where: { userId: user.id } })
        if (!ownBarber || ownBarber.id !== barberId) throw Object.assign(new Error('forbidden'), { code: 403 })
      }

      const conflict = await tx.appointment.findFirst({
        where: {
          barberId,
          status: { not: 'CANCELLED' },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      })
      if (conflict) throw Object.assign(new Error('slot_taken'), { code: 409 })

      const block = await tx.unavailabilityBlock.findFirst({
        where: {
          barberId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
      })
      if (block) throw Object.assign(new Error('slot_taken'), { code: 409 })

      return await tx.appointment.create({
        data: { clientId, barberId, serviceId, startTime: start, endTime: end, status: 'CONFIRMED' },
        include: {
          client: { select: { name: true } },
          service: { select: { name: true } },
        },
      })
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (err: unknown) {
    const e = err as Error
    if (e.message === 'forbidden') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (e.message === 'barber_unavailable') return NextResponse.json({ error: 'Barber unavailable' }, { status: 400 })
    if (e.message === 'slot_taken') return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
    throw err
  }
}
