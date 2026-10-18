import { useState } from 'react'

// This records guide acknowledgement only; it is never evidence of rental history.
const storageKey = (userId: number) => `subak:locker-guide:v1:user:${userId}`
const acknowledgedInSession = new Set<number>()

const hasAcknowledgedGuide = (userId: number) => {
  if (acknowledgedInSession.has(userId)) return true
  try {
    return window.localStorage.getItem(storageKey(userId)) === 'completed'
  } catch {
    return false
  }
}

export const useRentalOnboarding = (
  userId: number | undefined,
  onRent: (visibleNum: number) => void,
) => {
  const [pending, setPending] = useState<{ userId: number; visibleNum: number } | null>(null)

  const requestRental = (visibleNum: number) => {
    if (userId === undefined) return
    if (hasAcknowledgedGuide(userId)) onRent(visibleNum)
    else setPending({ userId, visibleNum })
  }

  const complete = () => {
    // Do not continue a pending rental if the signed-in account has changed.
    if (!pending || pending.userId !== userId) return
    acknowledgedInSession.add(userId)
    try {
      window.localStorage.setItem(storageKey(userId), 'completed')
    } catch {
      // In restricted browsers, acknowledgement lasts for this session only.
    }
    setPending(null)
    onRent(pending.visibleNum)
  }

  return {
    isOpen: pending !== null && pending.userId === userId,
    requestRental,
    complete,
    close: () => setPending(null),
  }
}
