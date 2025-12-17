import { useToast } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  buyStoreItem,
  getCabinetDetail,
  getCabinetSummary,
  getCabinetSummaryAll,
  getCabinets,
  rentCabinet,
  returnCabinet,
  useExtensionTicket,
  usePenaltyTicket,
  useSwapTicket,
} from '@/features/lockers/api/lockers'
import { useAuthToken } from '@/features/auth/hooks/useAuthToken'
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
  requiresAuth?: boolean
}

const getFloorKey = (floor?: number | null) =>
  typeof floor === 'number' && !Number.isNaN(floor) ? floor : 'unknown'

export const useCabinetsQuery = ({
  floor,
  enabled = true,
  requiresAuth = true,
}: FloorQueryOptions) => {
  const { token } = useAuthToken()
  const allowWithoutToken = !requiresAuth

  return useQuery({
    queryKey: cabinetKeys.list(getFloorKey(floor)),
    queryFn: () => {
      if (typeof floor !== 'number') {
        throw new Error('floor 값이 필요합니다.')
      }
      return getCabinets(floor, { publicAccess: !requiresAuth })
    },
    enabled: Boolean((allowWithoutToken || token) && typeof floor === 'number' && enabled),
  })
}

export const useCabinetSummaryQuery = ({
  floor,
  enabled = true,
  requiresAuth = true,
}: FloorQueryOptions) => {
  const { token } = useAuthToken()
  const allowWithoutToken = !requiresAuth

  return useQuery({
    queryKey: cabinetSummaryKeys.list(getFloorKey(floor)),
    queryFn: () => {
      if (typeof floor !== 'number') {
        throw new Error('floor 값이 필요합니다.')
      }
      return getCabinetSummary(floor)
    },
    enabled: Boolean((allowWithoutToken || token) && typeof floor === 'number' && enabled),
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
  const { token } = useAuthToken()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, number>({
    mutationFn: async (cabinetId: number) => {
      if (!token) {
        throw new Error('로그인이 필요합니다.')
      }
      return rentCabinet(cabinetId)
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
  const { token } = useAuthToken()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: async () => {
      if (!token) {
        throw new Error('로그인이 필요합니다.')
      }
      return returnCabinet()
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

export const useBuyItemMutation = () => {
  const toast = useToast()
  const { token } = useAuthToken()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, number>({
    mutationFn: async (itemId: number) => {
      if (!token) {
        throw new Error('로그인이 필요합니다.')
      }
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
  const { token } = useAuthToken()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: async () => {
      if (!token) throw new Error('로그인이 필요합니다.')
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
  const { token } = useAuthToken()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult, unknown, number>({
    mutationFn: async (targetCabinetId: number) => {
      if (!token) throw new Error('로그인이 필요합니다.')
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
  const { token } = useAuthToken()
  const invalidate = useInvalidateLockerQueries()

  return useMutation<LockerActionResult>({
    mutationFn: async () => {
      if (!token) throw new Error('로그인이 필요합니다.')
      return usePenaltyTicket()
    },
    onSuccess: (result) => {
      toast({ description: result.message ?? '감면권을 사용했습니다.', status: 'success' })
      invalidate()
    },
    onError: (error) => toast({ description: parseErrorMessage(error), status: 'error' }),
  })
}
