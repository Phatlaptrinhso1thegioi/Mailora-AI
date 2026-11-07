// Rate Limiting helper
const memoryRateMap = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(key: string, limit = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const record = memoryRateMap.get(key);

  if (!record || record.expiresAt < now) {
    memoryRateMap.set(key, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}
