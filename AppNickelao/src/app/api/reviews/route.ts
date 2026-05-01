import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId, text, imageUrl } = await req.json()
  if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 })

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!appointment || appointment.clientId !== user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const existing = await prisma.review.findUnique({ where: { appointmentId } })
  if (existing) return NextResponse.json({ error: 'Already reviewed' }, { status: 409 })

  const review = await prisma.review.create({
    data: {
      appointmentId,
      clientId: user.id,
      text: text ?? null,
      pointsAwarded: 5,
      ...(imageUrl && { portfolioImages: { create: { clientId: user.id, imageUrl } } }),
    },
  })

  await prisma.user.update({ where: { id: user.id }, data: { points: { increment: 5 } } })
  await prisma.pointsLog.create({ data: { userId: user.id, amount: 5, reason: 'Reseña + foto' } })

  return NextResponse.json(review, { status: 201 })
}
