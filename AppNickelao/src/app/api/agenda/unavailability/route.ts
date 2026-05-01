import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { barber: true },
  })
  if (!fullUser?.barber) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { startTime, endTime, reason } = await req.json()
  if (!startTime || !endTime) return NextResponse.json({ error: 'startTime and endTime required' }, { status: 400 })

  const block = await prisma.unavailabilityBlock.create({
    data: {
      barberId: fullUser.barber.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason: reason ?? null,
    },
  })

  return NextResponse.json(block, { status: 201 })
}
