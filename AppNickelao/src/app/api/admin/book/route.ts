import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
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

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const start = new Date(startTime)
  const end = new Date(start.getTime() + service.duration * 60 * 1000)

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      barberId,
      serviceId,
      startTime: start,
      endTime: end,
      status: 'CONFIRMED',
    },
    include: {
      client: { select: { name: true } },
      service: { select: { name: true } },
    },
  })

  return NextResponse.json(appointment, { status: 201 })
}
