import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN_GENERAL') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json() as { isActive?: boolean; location?: string }

  const data: Record<string, unknown> = {}
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.location !== undefined) data.location = body.location

  const updated = await prisma.barber.update({
    where: { id },
    data,
    select: { id: true, isActive: true, location: true },
  })

  return NextResponse.json(updated)
}
