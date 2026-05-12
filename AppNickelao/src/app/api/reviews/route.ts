import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, getIp } from '@/lib/rateLimit'

export async function POST(req: Request) {
  if (!rateLimit(getIp(req), 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointmentId, text, imageUrl, rating } = await req.json()
  if (!appointmentId) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 })
  if (!rating || rating < 1 || rating > 5) return NextResponse.json({ error: 'rating required (1-5)' }, { status: 400 })
  if (text !== undefined && (typeof text !== 'string' || text.length > 1000)) {
    return NextResponse.json({ error: 'text must be under 1000 characters' }, { status: 400 })
  }
  if (imageUrl !== undefined) {
    if (typeof imageUrl !== 'string' || imageUrl.length > 500) {
      return NextResponse.json({ error: 'Invalid imageUrl' }, { status: 400 })
    }
    try { const u = new URL(imageUrl); if (!['https:', 'http:'].includes(u.protocol)) throw new Error() }
    catch { return NextResponse.json({ error: 'imageUrl must be a valid URL' }, { status: 400 }) }
  }

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
      rating,
      pointsAwarded: 5,
      ...(imageUrl && { portfolioImages: { create: { clientId: user.id, imageUrl } } }),
    },
  })

  await prisma.user.update({ where: { id: user.id }, data: { points: { increment: 5 } } })
  await prisma.pointsLog.create({ data: { userId: user.id, amount: 5, reason: 'Reseña + foto' } })

  return NextResponse.json(review, { status: 201 })
}
