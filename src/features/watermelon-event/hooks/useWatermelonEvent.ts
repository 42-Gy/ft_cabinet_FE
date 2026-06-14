import { useToast } from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  buyWatermelonEventItem,
  enhanceWatermelon,
  getWatermelonEventConfig,
  getWatermelonEventLogs,
  getWatermelonEventMe,
  getWatermelonEventRankings,
} from '@/features/watermelon-event/api/watermelonEvent'
import type {
  BuyEventItemRequest,
  EnhanceRequest,
  EnhanceResult,
  EventInventoryResult,
  WatermelonEventMe,
} from '@/features/watermelon-event/types'

const defaultErrorMessage = '이벤트 요청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'

export const watermelonEventKeys = {
  root: ['watermelon-event'] as const,
  me: ['watermelon-event', 'me'] as const,
  config: ['watermelon-event', 'config'] as const,
  rankings: (page: number, size: number) => ['watermelon-event', 'rankings', page, size] as const,
  logs: ['watermelon-event', 'logs'] as const,
}

const parseEventError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data?.error?.message) return data.error.message
    if (data?.message) return data.message
  }
  if (error instanceof Error) return error.message
  return defaultErrorMessage
}

const useInvalidateEventQueries = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: watermelonEventKeys.root })
  }
}

export const useWatermelonEventMeQuery = () =>
  useQuery({
    queryKey: watermelonEventKeys.me,
    queryFn: getWatermelonEventMe,
  })

export const useWatermelonEventConfigQuery = () =>
  useQuery({
    queryKey: watermelonEventKeys.config,
    queryFn: getWatermelonEventConfig,
    staleTime: 1000 * 60 * 5,
  })

export const useWatermelonEventRankingsQuery = (page = 0, size = 10) =>
  useQuery({
    queryKey: watermelonEventKeys.rankings(page, size),
    queryFn: () => getWatermelonEventRankings(page, size),
  })

export const useWatermelonEventLogsQuery = () =>
  useQuery({
    queryKey: watermelonEventKeys.logs,
    queryFn: async () => {
      const logs = await getWatermelonEventLogs()
      return [...logs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    },
    refetchInterval: 4000,
  })

export const useEnhanceWatermelonMutation = () => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const invalidate = useInvalidateEventQueries()

  return useMutation<EnhanceResult, unknown, EnhanceRequest>({
    mutationFn: enhanceWatermelon,
    onSuccess: (result) => {
      queryClient.setQueryData<WatermelonEventMe | undefined>(watermelonEventKeys.me, (current) =>
        current
          ? {
              ...current,
              currentLevel: result.afterLevel,
              seedBalance: result.seedBalance,
              dropProtectionCount: result.dropProtectionCount,
              destroyProtectionCount: result.destroyProtectionCount,
              premiumFertilizerCount: result.premiumFertilizerCount,
              dangerousFertilizerCount: result.dangerousFertilizerCount,
            }
          : current,
      )
      invalidate()
    },
    onError: (error) => {
      toast({ description: parseEventError(error), status: 'error' })
    },
  })
}


export const useBuyWatermelonEventItemMutation = () => {
  const toast = useToast()
  const queryClient = useQueryClient()
  const invalidate = useInvalidateEventQueries()

  return useMutation<EventInventoryResult, unknown, BuyEventItemRequest>({
    mutationFn: buyWatermelonEventItem,
    onSuccess: (result) => {
      queryClient.setQueryData<WatermelonEventMe | undefined>(watermelonEventKeys.me, (current) =>
        current
          ? {
              ...current,
              seedBalance: result.seedBalance,
              dropProtectionCount: result.dropProtectionCount,
              destroyProtectionCount: result.destroyProtectionCount,
              premiumFertilizerCount: result.premiumFertilizerCount,
              dangerousFertilizerCount: result.dangerousFertilizerCount,
            }
          : current,
      )
      toast({ description: '이벤트 아이템을 구매했습니다.', status: 'success' })
      invalidate()
    },
    onError: (error) => {
      toast({ description: parseEventError(error), status: 'error' })
    },
  })
}
