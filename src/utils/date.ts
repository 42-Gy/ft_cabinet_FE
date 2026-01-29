const parseKoreanDateTime = (value: string) => {
  const match = value.match(/(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  const [, month, day, hour, minute] = match
  const year = new Date().getFullYear()
  const date = new Date(
    year,
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  )
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatDate = (value: string) => {
  const parsed = parseKoreanDateTime(value)
  const date = parsed ?? new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
