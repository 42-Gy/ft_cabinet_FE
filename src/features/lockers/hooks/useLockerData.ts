import { useToast } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  buyStoreItem,
  cancelReservation,
  checkReturnImage,
  usePenaltyTicket as exemptPenaltyWithTicket,
  useExtensionTicket as extendWithTicket,
  getCabinetDetail,
  getCabinets,
  getCabinetSummary,
  getCabinetSummaryAll,
  renewLentCabinet,
  rentCabinet,
  reserveCabinet,
  returnCabinet,
  swapCabinet,
  updateAutoExtension,
  type ReturnCabinetPayload,
  type SwapCabinetPayload,
} from '@/features/lockers/api/lockers'
import { meQueryKeys } from '@/features/users/hooks/useMeQuery'
import type { LockerActionResult } from '@/types/locker'

const defaultErrorMessage = '요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'

const parseErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (!error.response)
      return '요청 결과를 확인할 수 없습니다. 최신 예약 상태를 확인한 후 다시 시도해주세요.'
    if (error.response?.status === 409)
      return '현재 처리 중인 요청입니다. 잠시 후 다시 시도해주세요.'
    if (error.response?.status === 429) return '예약 요청이 많습니다. 잠시 후 다시 시도해주세요.'
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data?.error?.message) return data.error.message
    if (data?.message) return data.message
  }
  if (error instanceof Error) return error.message
  return defaultErrorMessage
}

const resolveSuccessMessage = (message: string | null | undefined, fallback: string) => {
  if (!message) return fallback
  if (/success/i.test(message)) return fallback
  return message
}

const cabinetKeys = {
  root: ['cabinets'] as const,
  list: (floor: number | string) => ['cabinets', 'list', floor] as const,
}

const cabinetSummaryKeys = {
  root: ['cabinet-summary'] as const,
  list: (floor: number | string) => ['cabinet-summary', floor] as const,
}

const cabinetSummaryAllKey = ['cabinet-summary-all'] as const

const cabinetDetailKeys = {
  root: ['cabinet-detail'] as const,
  detail: (cabinetId: number | string, authenticated = false) =>
    ['cabinet-detail', cabinetId, authenticated] as const,
}

interface FloorQueryOptions {
  floor?: number | null
  enabled?: boolean
}

const getFloorKey = (floor?: number | null) =>
  typeof floor === 'number' && !Number.isNaN(floor) ? floor : 'unknown'

export const useCabinetsQuery = ({ floor, enabled = true }: FloorQueryOptions) => {
  return useQuery({
    queryKey: cabinetKeys.list(getFloorKey(floor)),
    queryFn: () => {
      if (typeof floor !== 'number') {
        throw new Error('floor 값이 필요합니다.')
      }
      return getCabinets(floor, { publicAccess: false })
    },
    enabled: Boolean(typeof floor === 'number' && enabled),
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })
}

export const useCabinetSummaryQuery = ({ floor, enabled = true }: FloorQueryOptions) => {
  return useQuery({
    queryKey: cabinetSummaryKeys.list(getFloorKey(floor)),
    queryFn: () => {
      if (typeof floor !== 'number') {
        throw new Error('floor 값이 필요합니다.')
      }
      return getCabinetSummary(floor)
    },
    enabled: Boolean(typeof floor === 'number' && enabled),
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export const useCabinetSummaryAllQuery = () =>
  useQuery({
    queryKey: cabinetSummaryAllKey,
    queryFn: getCabinetSummaryAll,
    retry: false,
    refetchOnWindowFocus: false,
  })

export const useCabinetDetailQuery = (cabinetId?: number | null, authenticated = false) =>
  useQuery({
    queryKey: cabinetDetailKeys.detail(cabinetId ?? 'none', authenticated),
    queryFn: () => {
      if (typeof cabinetId !== 'number') {
        throw new Error('사물함 번호가 필요합니다.')
      }
      return getCabinetDetail(cabinetId, authenticated)
    },
    enabled: typeof cabinetId === 'number',
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })

const useInvalidateLockerQueries = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: cabinetKeys.root }),
      queryClient.invalidateQueries({ queryKey: cabinetSummaryKeys.root }),
      queryClient.invalidateQueries({ queryKey: cabinetSummaryAllKey }),
      queryClient.invalidateQueries({ queryKey: cabinetDetailKeys.root }),
      queryClient.invalidateQueries({ queryKey: meQueryKeys.root }),
    ])
}

export const useRentCabinetMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()
  const isRentSuccessMessage = (message?: string | null) => {
    if (!message) return true
    return (
      message.includes('성공') ||
      message.includes('완료') ||
      message.includes('✅') ||
      /success/i.test(message)
    )
  }

  return useMutation<LockerActionResult, unknown, number>({
    mutationFn: async (cabinetId: number) => {
      const result = await rentCabinet(cabinetId)
      if (!isRentSuccessMessage(result.message)) {
        throw new Error(result.message ?? '사물함 대여에 실패했습니다.')
      }
      return result
    },
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '대여가 완료되었습니다.'),
        status: 'success',
      })
      return invalidate()
    },
    onError: (error) => {
      toast({ description: parseErrorMessage(error), status: 'error' })
      void invalidate()
    },
  })
}

export const useReturnCabinetMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, ReturnCabinetPayload>({
    mutationFn: async (payload) => {
      return returnCabinet(payload)
    },
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '사물함 반납이 완료되었습니다.'),
        status: 'success',
      })
      invalidate()
    },
    onError: (error) => {
      toast({ description: parseErrorMessage(error), status: 'error' })
    },
  })
}

export const useCheckReturnImageMutation = () => {
  const toast = useToast()
  return useMutation<LockerActionResult, unknown, File>({
    mutationFn: async (file: File) => checkReturnImage(file),
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '이미지 검증이 완료되었습니다.'),
        status: 'success',
      })
    },
    onError: (error) => {
      toast({ description: parseErrorMessage(error), status: 'error' })
    },
  })
}

export const useBuyItemMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, number>({
    mutationFn: async (itemId: number) => {
      return buyStoreItem(itemId)
    },
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '아이템 구매가 완료되었습니다.'),
        status: 'success',
      })
      invalidate()
    },
    onError: (error) => {
      toast({ description: parseErrorMessage(error), status: 'error' })
    },
  })
}

export const lockerQueryKeys = {
  cabinets: cabinetKeys,
  summaries: cabinetSummaryKeys,
  summaryAll: cabinetSummaryAllKey,
  detail: cabinetDetailKeys,
}

export const useReserveCabinetMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()
  return useMutation<LockerActionResult, unknown, number>({
    mutationFn: async (visibleNum) => reserveCabinet(visibleNum),
    retry: false,
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '사물함 예약이 되었습니다.'),
        status: 'success',
      })
    },
    onError: (error) => {
      const message = parseErrorMessage(error)
      toast({ description: message, status: message.includes('이미 예약') ? 'info' : 'error' })
    },
    onSettled: () => invalidate(),
  })
}

export const useCancelReservationMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()
  return useMutation<LockerActionResult, unknown, void>({
    mutationFn: cancelReservation,
    retry: false,
    onSuccess: (result) => toast({ description: result.message, status: 'info' }),
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
    onSettled: () => invalidate(),
  })
}

export const useExtendTicketMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: async () => {
      return extendWithTicket()
    },
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '연장권을 사용했습니다.'),
        status: 'success',
      })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
  })
}

export const useSwapCabinetMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, SwapCabinetPayload>({
    mutationFn: async (payload) => swapCabinet(payload),
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '이사 완료되었습니다.'),
        status: 'success',
      })
      return invalidate()
    },
    onError: (error) => {
      toast({ description: parseErrorMessage(error), status: 'error' })
      void invalidate()
    },
  })
}

export const usePenaltyTicketMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: async () => {
      return exemptPenaltyWithTicket()
    },
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '감면권을 사용했습니다.'),
        status: 'success',
      })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
  })
}

export const useRenewTicketMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: renewLentCabinet,
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '대여권 연장이 완료되었습니다.'),
        status: 'success',
      })
      invalidate()
    },
    onError: (error) => {
      toast({ description: parseErrorMessage(error), status: 'error' })
    },
  })
}

export const useAutoExtensionMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, boolean>({
    mutationFn: async (enabled) => {
      return updateAutoExtension(enabled)
    },
    onSuccess: (result) => {
      toast({
        description: resolveSuccessMessage(result.message, '자동 연장 설정이 변경되었습니다.'),
        status: 'success',
      })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
  })
}
