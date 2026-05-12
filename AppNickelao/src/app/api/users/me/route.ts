import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, phone, image } = body

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 100)) {
    return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  }
  if (phone !== undefined && (typeof phone !== 'string' || phone.length > 20)) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
  }
  if (image !== undefined && (typeof image !== 'string' || image.length > 500)) {
    return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(phone !== undefined && { phone }),
      ...(image !== undefined && { image }),
    },
  })
  return NextResponse.json(updated)
}
