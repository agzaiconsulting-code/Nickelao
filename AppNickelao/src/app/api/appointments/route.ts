import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appointments = await prisma.appointment.findMany({
    where: { clientId: user.id },
    orderBy: { startTime: 'desc' },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      status: true,
      service: { select: { name: true, duration: true, price: true } },
      barber: { select: { location: true, user: { select: { name: true } } } },
      review: { select: { id: true } },
    },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (user.isBlocked) {
    return NextResponse.json(
      { error: 'blocked', reason: user.blockedReason, blockedAt: user.blockedAt },
      { status: 403 }
    )
  }

  const { barberId, serviceId, startTime, autoAssigned } = await req.json()
  if (!barberId || !serviceId || !startTime) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const start = new Date(startTime)
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'Invalid startTime' }, { status: 400 })
  }
  if (start.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Cannot book in the past' }, { status: 400 })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  if (!service.isActive) return NextResponse.json({ error: 'Service unavailable' }, { status: 400 })

  const end = new Date(start.getTime() + service.duration * 60_000)

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      const barber = await tx.barber.findUnique({ where: { id: barberId } })
      if (!barber || !barber.isActive) throw Object.assign(new Error('barber_unavailable'), { code: 400 })

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

      const appt = await tx.appointment.create({
        data: {
          clientId: user.id,
          barberId,
          serviceId,
          startTime: start,
          endTime: end,
          status: 'CONFIRMED',
          autoAssigned: !!autoAssigned,
        },
        include: {
          service: true,
          barber: { include: { user: { select: { name: true } } } },
        },
      })

      await tx.pointsLog.create({ data: { userId: user.id, amount: 5, reason: 'Reserva confirmada' } })
      await tx.user.update({ where: { id: user.id }, data: { points: { increment: 5 } } })

      return appt
    })

    return NextResponse.json(appointment)
  } catch (err: unknown) {
    const e = err as Error
    if (e.message === 'barber_unavailable') return NextResponse.json({ error: 'Barber unavailable' }, { status: 400 })
    if (e.message === 'slot_taken') return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 })
    throw err
  }
}
