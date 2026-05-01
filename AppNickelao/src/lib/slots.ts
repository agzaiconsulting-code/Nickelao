export interface BlockedRange {
  start: Date
  end: Date
}

function getShopHours(date: Date): { open: number; close: number } | null {
  const day = date.getDay()
  if (day === 0) return null
  if (day === 6) return { open: 9 * 60, close: 15 * 60 }
  return { open: 9 * 60, close: 20 * 60 }
}

export function calculateAvailableSlots(
  date: Date,
  durationMin: number,
  blockedRanges: BlockedRange[]
): string[] {
  const hours = getShopHours(date)
  if (!hours) return []

  const base = new Date(date)
  base.setHours(0, 0, 0, 0)

  const slots: string[] = []

  for (let m = hours.open; m + durationMin <= hours.close; m += durationMin) {
    const slotStart = new Date(base.getTime() + m * 60_000)
    const slotEnd = new Date(slotStart.getTime() + durationMin * 60_000)

    const blocked = blockedRanges.some(r => slotStart < r.end && slotEnd > r.start)
    if (!blocked) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0')
      const mm = String(m % 60).padStart(2, '0')
      slots.push(`${hh}:${mm}`)
    }
  }

  return slots
}
