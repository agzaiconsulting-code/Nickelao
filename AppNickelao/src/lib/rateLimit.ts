// In-memory sliding window rate limiter — resets on server restart (acceptable for single-instance)
interface Window {
  count: number
  resetAt: number
}

const store = new Map<string, Window>()

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

export function getIp(req: Request): string {
  const xff = (req as Request & { headers: Headers }).headers.get('x-forwarded-for')
  return xff ? xff.split(',')[0].trim() : 'unknown'
}
