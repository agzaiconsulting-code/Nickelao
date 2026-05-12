import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['ADMIN_SHOP', 'ADMIN_GENERAL'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json() as { isBlocked: boolean; blockedReason?: string }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!target || target.role !== 'CLIENT') {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: body.isBlocked
      ? {
          isBlocked: true,
          blockedReason: body.blockedReason ?? 'No asistencia',
          blockedAt: new Date(),
        }
      : {
          isBlocked: false,
          blockedReason: null,
          blockedAt: null,
        },
    select: { id: true, name: true, isBlocked: true, blockedReason: true, blockedAt: true },
  })

  return NextResponse.json(updated)
}
