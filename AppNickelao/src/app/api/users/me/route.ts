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

  const { name, lastName, phone } = await req.json()
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name && { name }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
    },
  })

  return NextResponse.json(updated)
}
