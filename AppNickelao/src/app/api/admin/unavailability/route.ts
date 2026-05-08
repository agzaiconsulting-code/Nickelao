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

  const block = await prisma.unavailabilityBlock.create({
    data: {
      barberId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason: reason ?? null,
    },
  })

  return NextResponse.json(block, { status: 201 })
}
