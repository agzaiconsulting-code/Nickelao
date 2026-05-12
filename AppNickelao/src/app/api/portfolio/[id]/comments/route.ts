import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { rateLimit, getIp } from '@/lib/rateLimit'

const MAX_COMMENT_LENGTH = 500

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!rateLimit(getIp(req), 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 })
  if (text.trim().length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: `Comment exceeds ${MAX_COMMENT_LENGTH} characters` }, { status: 400 })
  }

  const image = await prisma.portfolioImage.findUnique({ where: { id } })
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const comment = await prisma.comment.create({
    data: { portfolioImageId: id, userId: user.id, text: text.trim() },
    include: { user: { select: { name: true, image: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}
