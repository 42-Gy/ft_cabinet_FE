import { useToast } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  buyStoreItem,
  checkReturnImage,
  getCabinetDetail,
  getCabinetSummary,
  getCabinetSummaryAll,
  getCabinets,
  rentCabinet,
  returnCabinet,
  updateAutoExtension,
  useExtensionTicket,
  usePenaltyTicket,
  useSwapTicket,
  type ReturnCabinetPayload,
} from '@/features/lockers/api/lockers'
import { meQueryKeys } from '@/features/users/hooks/useMeQuery'
import type { LockerActionResult } from '@/types/locker'

const defaultErrorMessage = '요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'

const parseErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data?.message) return data.message
  }
  if (error instanceof Error) return error.message
  return defaultErrorMessage
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
  detail: (cabinetId: number | string) => ['cabinet-detail', cabinetId] as const,
}

interface FloorQueryOptions {
  floor?: number | null
  enabled?: boolean
}

const getFloorKey = (floor?: number | null) =>
  typeof floor === 'number' && !Number.isNaN(floor) ? floor : 'unknown'

export const useCabinetsQuery = ({
  floor,
  enabled = true,
}: FloorQueryOptions) => {
  return useQuery({
    queryKey: cabinetKeys.list(getFloorKey(floor)),
    queryFn: () => {
      if (typeof floor !== 'number') {
        throw new Error('floor 값이 필요합니다.')
      }
      return getCabinets(floor, { publicAccess: false })
    },
    enabled: Boolean(typeof floor === 'number' && enabled),
  })
}

export const useCabinetSummaryQuery = ({
  floor,
  enabled = true,
}: FloorQueryOptions) => {
  return useQuery({
    queryKey: cabinetSummaryKeys.list(getFloorKey(floor)),
    queryFn: () => {
      if (typeof floor !== 'number') {
        throw new Error('floor 값이 필요합니다.')
      }
      return getCabinetSummary(floor)
    },
    enabled: Boolean(typeof floor === 'number' && enabled),
  })
}

export const useCabinetSummaryAllQuery = () =>
  useQuery({
    queryKey: cabinetSummaryAllKey,
    queryFn: getCabinetSummaryAll,
  })

export const useCabinetDetailQuery = (cabinetId?: number | null) =>
  useQuery({
    queryKey: cabinetDetailKeys.detail(cabinetId ?? 'none'),
    queryFn: () => {
      if (typeof cabinetId !== 'number') {
        throw new Error('사물함 번호가 필요합니다.')
      }
      return getCabinetDetail(cabinetId)
    },
    enabled: typeof cabinetId === 'number',
  })

const useInvalidateLockerQueries = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: cabinetKeys.root })
    queryClient.invalidateQueries({ queryKey: cabinetSummaryKeys.root })
    queryClient.invalidateQueries({ queryKey: cabinetSummaryAllKey })
    queryClient.invalidateQueries({ queryKey: meQueryKeys.root })
  }
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
      toast({ description: result.message ?? '사물함 대여가 완료되었습니다.', status: 'success' })
      invalidate()
    },
    onError: (error) => {
      toast({ description: parseErrorMessage(error), status: 'error' })
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
      toast({ description: result.message ?? '사물함 반납이 완료되었습니다.', status: 'success' })
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
      toast({ description: result.message ?? '이미지 검증이 완료되었습니다.', status: 'success' })
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
      toast({ description: result.message ?? '아이템 구매가 완료되었습니다.', status: 'success' })
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

export const useExtendTicketMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: async () => {
      return useExtensionTicket()
    },
    onSuccess: (result) => {
      toast({ description: result.message ?? '연장권을 사용했습니다.', status: 'success' })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
  })
}

export const useSwapTicketMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, number>({
    mutationFn: async (targetCabinetId: number) => {
      return useSwapTicket(targetCabinetId)
    },
    onSuccess: (result) => {
      toast({ description: result.message ?? '이사권을 사용했습니다.', status: 'success' })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
  })
}

export const usePenaltyTicketMutation = () => {
  const toast = useToast()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: async () => {
      return usePenaltyTicket()
    },
    onSuccess: (result) => {
      toast({ description: result.message ?? '감면권을 사용했습니다.', status: 'success' })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
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
      toast({ description: result.message ?? '자동 연장 설정이 변경되었습니다.', status: 'success' })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
  })
}
