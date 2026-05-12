import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json() as { barberId?: string; startTime?: string; endTime?: string; reason?: string }
  const { barberId, startTime, endTime, reason } = body

  if (!barberId || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })
  }
  if (start >= end) {
    return NextResponse.json({ error: 'startTime must be before endTime' }, { status: 400 })
  }

  const barber = await prisma.barber.findUnique({ where: { id: barberId } })
  if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })

  const block = await prisma.unavailabilityBlock.create({
    data: { barberId, startTime: start, endTime: end, reason: reason ?? null },
  })

  return NextResponse.json(block, { status: 201 })
}
