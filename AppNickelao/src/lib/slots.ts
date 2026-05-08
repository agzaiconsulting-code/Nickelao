export interface BlockedRange {
  start: Date
  end: Date
}

// Mon–Fri: 09:30–13:30 and 16:00–20:30 · Sat: 09:00–13:00 · Sun: closed
// Times are stored/compared as UTC (we treat UTC = local Spain time throughout the app)
function getWorkingBlocks(dow: number): [number, number][] {
  if (dow === 0) return []
  if (dow === 6) return [[9 * 60, 13 * 60]]
  return [[9 * 60 + 30, 13 * 60 + 30], [16 * 60, 20 * 60 + 30]]
}

function minToHHMM(m: number) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

export function calculateAvailableSlots(
  date: Date,
  durationMin: number,
  blockedRanges: BlockedRange[]
): string[] {
  const dow = date.getUTCDay()
  const blocks = getWorkingBlocks(dow)
  if (blocks.length === 0) return []

  // Day anchor in UTC
  const dayMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

  const slots: string[] = []
  for (const [open, close] of blocks) {
    for (let m = open; m + durationMin <= close; m += 15) {
      const slotStart = dayMs + m * 60_000
      const slotEnd   = slotStart + durationMin * 60_000
      const blocked = blockedRanges.some(r => slotStart < r.end.getTime() && slotEnd > r.start.getTime())
      if (!blocked) slots.push(minToHHMM(m))
    }
  }
  return slots
}
