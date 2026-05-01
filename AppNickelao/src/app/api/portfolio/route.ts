import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const images = await prisma.portfolioImage.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, lastName: true, avatarUrl: true } },
      comments: {
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { name: true, avatarUrl: true } } },
      },
      _count: { select: { comments: true } },
    },
  })
  return NextResponse.json(images)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageUrl, reviewId } = await req.json()
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

  const image = await prisma.portfolioImage.create({
    data: { clientId: user.id, imageUrl, reviewId: reviewId ?? null },
  })

  return NextResponse.json(image, { status: 201 })
}
