const fallbackTargetKst = () => {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const partValue = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0)
  const year = partValue('year')
  const month = partValue('month')
  const day = partValue('day')

  return new Date(Date.UTC(year, month - 1, day + 1, 1, 0, 0))
}

export const getMaintenanceEndAt = () => {
  const raw = import.meta.env.VITE_MAINTENANCE_END_AT
  if (raw) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }
  return fallbackTargetKst()
}

export const formatKstDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

