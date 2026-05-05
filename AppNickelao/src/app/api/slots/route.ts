import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateAvailableSlots } from '@/lib/slots'

// GET /api/slots?barberIds=id1,id2&date=YYYY-MM-DD&duration=30
// Returns {time: "09:30", barberId: "..."}[]
// Times stored/compared as UTC (UTC = local Spain time convention)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const barberIdsStr = searchParams.get('barberIds') ?? ''
  const dateStr      = searchParams.get('date') ?? ''
  const duration     = parseInt(searchParams.get('duration') ?? '0')

  if (!barberIdsStr || !dateStr || duration <= 0) return NextResponse.json([])

  const barberIds = barberIdsStr.split(',').filter(Boolean)
  const date      = new Date(`${dateStr}T00:00:00.000Z`)
  const dayStart  = new Date(`${dateStr}T00:00:00.000Z`)
  const dayEnd    = new Date(`${dateStr}T23:59:59.999Z`)

  const result: { time: string; barberId: string }[] = []
  const usedTimes = new Set<string>()

  for (const barberId of barberIds) {
    const [appointments, unavailability] = await Promise.all([
      prisma.appointment.findMany({
        where: { barberId, status: { not: 'CANCELLED' }, startTime: { gte: dayStart, lte: dayEnd } },
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

    const slots = calculateAvailableSlots(date, duration, blocked)
    for (const time of slots) {
      if (!usedTimes.has(time)) {
        usedTimes.add(time)
        result.push({ time, barberId })
      }
    }
  }

  result.sort((a, b) => a.time.localeCompare(b.time))
  return NextResponse.json(result)
}
