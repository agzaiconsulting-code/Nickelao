import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Call this endpoint from cron-job.org every day
// Header required: Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [sessions, blocks, appointments] = await Promise.all([
    // Expired NextAuth sessions (not cleaned up automatically)
    prisma.session.deleteMany({
      where: { expires: { lt: now } },
    }),
    // Past unavailability blocks older than 30 days (no longer needed for conflict checks)
    prisma.unavailabilityBlock.deleteMany({
      where: { endTime: { lt: thirtyDaysAgo } },
    }),
    // Cancelled appointments older than 6 months (keep completed/no-show for history)
    prisma.appointment.deleteMany({
      where: {
        status: 'CANCELLED',
        createdAt: { lt: sixMonthsAgo },
      },
    }),
  ])

  return NextResponse.json({
    deleted: {
      sessions: sessions.count,
      unavailabilityBlocks: blocks.count,
      cancelledAppointments: appointments.count,
    },
    ranAt: now.toISOString(),
  })
}
