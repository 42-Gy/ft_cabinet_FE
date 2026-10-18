import { useEffect, useRef, useState } from 'react'

// The server snapshot is the only source of a deadline. Background time is not lost.
export const useReservationClock = (
  visibleNum: number | null | undefined,
  seconds: number | null | undefined,
  updatedAt: number,
  refresh: () => unknown,
) => {
  const [now, setNow] = useState(() => Date.now())
  const refreshedReservation = useRef<number | null>(null)
  const deadline =
    typeof seconds === 'number' && Number.isFinite(seconds)
      ? updatedAt + Math.max(0, seconds) * 1000
      : null
  const remaining =
    deadline === null ? null : Math.max(0, Math.ceil((deadline - Math.max(now, updatedAt)) / 1000))

  useEffect(() => {
    if (visibleNum == null || deadline === null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    const sync = () => {
      setNow(Date.now())
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', sync)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [visibleNum, deadline, refresh])

  useEffect(() => {
    if (visibleNum == null || (remaining != null && remaining > 0)) {
      refreshedReservation.current = null
    } else if (remaining === 0 && refreshedReservation.current !== visibleNum) {
      refreshedReservation.current = visibleNum
      refresh()
    }
  }, [visibleNum, remaining, refresh])

  return remaining
}
