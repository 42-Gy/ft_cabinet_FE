import { useToast } from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  fetchAdminDashboard,
  fetchAdminUserDetail,
  forceReturnCabinet,
  provideCoin,
  updateCabinetStatus,
  updateLogtime,
} from '@/features/admin/api/admin'
import type {
  CabinetStatusRequest,
  CoinProvideRequest,
  LogtimeUpdateRequest,
} from '@/features/admin/types'

export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  user: (name?: string) => ['admin', 'user', name ?? ''] as const,
}

export const useAdminDashboardQuery = () =>
  useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: fetchAdminDashboard,
  })

export const useAdminUserQuery = (name?: string) =>
  useQuery({
    queryKey: adminQueryKeys.user(name),
    queryFn: () => {
      if (!name) throw new Error('name is required')
      return fetchAdminUserDetail(name)
    },
    enabled: Boolean(name),
  })

const useAdminMutationToast = () => {
  const toast = useToast()
  return toast
}

export const useCoinProvideMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: CoinProvideRequest }) =>
      provideCoin(name, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '코인 지급 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description = error instanceof Error ? error.message : '코인 지급 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useLogtimeUpdateMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: LogtimeUpdateRequest }) =>
      updateLogtime(name, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '로그타임 수정 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '로그타임 수정 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useCabinetStatusMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({
      visibleNum,
      payload,
    }: {
      visibleNum: number
      payload: CabinetStatusRequest
    }) => updateCabinetStatus(visibleNum, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '사물함 상태 변경 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '사물함 상태 변경 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useCabinetForceReturnMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: (visibleNum: number) => forceReturnCabinet(visibleNum),
    onSuccess: (message) => {
      toast({ description: message ?? '강제 반납 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '강제 반납 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}
