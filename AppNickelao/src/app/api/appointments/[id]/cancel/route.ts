import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const appointment = await prisma.appointment.findFirst({ where: { id, clientId: user.id } })
  if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const hoursUntil = (appointment.startTime.getTime() - Date.now()) / 3_600_000
  if (hoursUntil < 12) return NextResponse.json({ error: 'too_soon' }, { status: 422 })

  await prisma.appointment.update({ where: { id }, data: { status: 'CANCELLED' } })
  return NextResponse.json({ ok: true })
}
