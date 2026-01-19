export const unwrapApiResponse = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data ?? (payload as T)
  }
  return payload as T
}

const tryArrayFromObject = <T>(payload: Record<string, unknown>): T[] | null => {
  const candidates = [
    'cabinets',
    'cabinetList',
    'items',
    'list',
    'content',
    'results',
    'summary',
    'summaries',
  ]
  for (const key of candidates) {
    const value = payload[key]
    if (Array.isArray(value)) return value as T[]
  }
  return null
}

export const coerceArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    const fromObject = tryArrayFromObject<T>(payload as Record<string, unknown>)
    if (fromObject) return fromObject
  }
  return []
}
