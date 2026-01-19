export const unwrapApiResponse = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data ?? (payload as T)
  }
  return payload as T
}

export const coerceArray = <T>(payload: unknown): T[] =>
  Array.isArray(payload) ? payload : []
