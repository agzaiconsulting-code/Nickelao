import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 })

  const comment = await prisma.comment.create({
    data: { portfolioImageId: id, userId: user.id, text: text.trim() },
    include: { user: { select: { name: true, avatarUrl: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}
