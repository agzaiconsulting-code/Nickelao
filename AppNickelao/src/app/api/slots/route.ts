import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { calculateAvailableSlots } from '@/lib/slots'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const barberId = searchParams.get('barberId')
  const dateStr = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')

  if (!barberId || !dateStr || !serviceId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

  const date = new Date(dateStr)
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const [appointments, unavailability] = await Promise.all([
    prisma.appointment.findMany({
      where: { barberId, status: { in: ['CONFIRMED'] }, startTime: { gte: dayStart, lte: dayEnd } },
      select: { startTime: true, endTime: true },
    }),
    prisma.unavailabilityBlock.findMany({
      where: { barberId, startTime: { gte: dayStart, lte: dayEnd } },
      select: { startTime: true, endTime: true },
    }),
  ])

  const blocked = [
    ...appointments.map(a => ({ start: a.startTime, end: a.endTime })),
    ...unavailability.map(u => ({ start: u.startTime, end: u.endTime })),
  ]

  const slots = calculateAvailableSlots(date, service.duration, blocked)
  return NextResponse.json({ slots })
}
