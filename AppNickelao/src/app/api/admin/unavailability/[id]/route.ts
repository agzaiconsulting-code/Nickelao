import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['BARBER', 'ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const block = await prisma.unavailabilityBlock.findUnique({ where: { id } })
  if (!block) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.unavailabilityBlock.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
