import { useState } from 'react'
import { useToast } from '@chakra-ui/react'

export type RentalIntent = 'rent' | 'swapReservation'

export const useRentalOnboarding = (
  userId: number | undefined,
  isFirstRental: boolean | undefined,
  onProceed: (visibleNum: number, intent: RentalIntent) => void,
) => {
  const toast = useToast()
  const [pending, setPending] = useState<{
    userId: number
    visibleNum: number
    intent: RentalIntent
  } | null>(null)

  const requestRental = (visibleNum: number, intent: RentalIntent = 'rent') => {
    if (userId === undefined || typeof isFirstRental !== 'boolean') {
      toast({
        status: 'warning',
        description: '최초 대여 정보를 확인할 수 없습니다. 내 정보를 새로고침해주세요.',
      })
      return
    }
    if (isFirstRental) setPending({ userId, visibleNum, intent })
    else onProceed(visibleNum, intent)
  }

  const complete = () => {
    if (!pending || pending.userId !== userId || typeof isFirstRental !== 'boolean') return
    setPending(null)
    onProceed(pending.visibleNum, pending.intent)
  }

  return {
    isOpen: pending !== null && pending.userId === userId,
    requestRental,
    complete,
    close: () => setPending(null),
  }
}
