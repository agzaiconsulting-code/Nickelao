import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, lastName, phone } = await req.json()
  if (!name || !lastName) return NextResponse.json({ error: 'name and lastName required' }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, lastName, phone: phone ?? null },
  })

  return NextResponse.json(updated)
}
