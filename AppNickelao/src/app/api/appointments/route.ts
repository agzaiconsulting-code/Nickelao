import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const appointments = await prisma.appointment.findMany({
    where: { clientId: user.id },
    orderBy: { startTime: 'desc' },
    include: {
      service: true,
      barber: { include: { user: { select: { name: true, lastName: true } } } },
      review: true,
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

  const { barberId, serviceId, startTime } = await req.json()
  if (!barberId || !serviceId || !startTime) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const start = new Date(startTime)
  const end = new Date(start.getTime() + service.duration * 60_000)

  const appointment = await prisma.appointment.create({
    data: { clientId: user.id, barberId, serviceId, startTime: start, endTime: end, status: 'CONFIRMED' },
    include: {
      service: true,
      barber: { include: { user: { select: { name: true, lastName: true } } } },
    },
  })

  await prisma.pointsLog.create({ data: { userId: user.id, amount: 5, reason: 'Reserva confirmada' } })
  await prisma.user.update({ where: { id: user.id }, data: { points: { increment: 5 } } })

  return NextResponse.json(appointment)
}
