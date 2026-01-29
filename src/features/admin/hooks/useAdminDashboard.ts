import { useToast } from '@chakra-ui/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  approvePendingCabinet,
  assignPenalty,
  demoteAdminRole,
  fetchAdminAttendanceStats,
  fetchAdminDashboard,
  fetchAdminFloorStats,
  fetchAdminStoreStats,
  fetchAdminUserDetail,
  fetchAdminUsers,
  fetchAdminWeeklyStats,
  fetchBrokenCabinets,
  fetchCabinetDetail,
  fetchCabinetHistory,
  fetchCabinetPendingList,
  fetchReturnPhotos,
  fetchCoinStats,
  fetchItemUsageStats,
  fetchOverdueUsers,
  fetchPenaltyUsers,
  forceReturnCabinet,
  grantItem,
  promoteAdminRole,
  provideCoin,
  removePenalty,
  revokeCoin,
  revokeItem,
  sendEmergencyNotice,
  updateCabinetStatus,
  updateCabinetStatusBundle,
  updateItemPrice,
  updateLogtime,
} from '@/features/admin/api/admin'
import type {
  AdminAttendanceStat,
  AdminBrokenCabinet,
  AdminCabinetHistoryPage,
  AdminCabinetPendingItem,
  AdminCoinStatsResponse,
  AdminFloorStatsResponse,
  AdminItemUsageStatsResponse,
  AdminOverdueUser,
  AdminPenaltyUser,
  AdminStoreStats,
  AdminWeeklyStats,
  AdminReturnPhotoPage,
  AdminUserListPage,
  CabinetStatusBundleRequest,
  CabinetStatusRequest,
  CoinProvideRequest,
  CoinRevokeRequest,
  EmergencyNoticeRequest,
  ItemGrantRequest,
  ItemPriceUpdateRequest,
  ItemRevokeRequest,
  LogtimeUpdateRequest,
  PenaltyAssignRequest,
} from '@/features/admin/types'

export const adminQueryKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  weekly: ['admin', 'weekly'] as const,
  floors: ['admin', 'floors'] as const,
  coins: ['admin', 'coins'] as const,
  items: ['admin', 'items'] as const,
  store: ['admin', 'store'] as const,
  attendance: (startDate?: string, endDate?: string) =>
    ['admin', 'attendance', startDate ?? '', endDate ?? ''] as const,
  user: (name?: string) => ['admin', 'user', name ?? ''] as const,
  users: (page = 0, size = 20, sort = '') =>
    ['admin', 'users', page, size, sort] as const,
  cabinet: (visibleNum?: number) => ['admin', 'cabinet', visibleNum ?? 0] as const,
  pending: ['admin', 'cabinets', 'pending'] as const,
  overdue: ['admin', 'cabinets', 'overdue'] as const,
  penaltyUsers: ['admin', 'users', 'penalty'] as const,
  brokenCabinets: ['admin', 'cabinets', 'broken'] as const,
  history: (visibleNum?: number, page = 0) =>
    ['admin', 'cabinets', 'history', visibleNum ?? 0, page] as const,
  returnPhotos: (page = 0, size = 10) =>
    ['admin', 'returns', 'photos', page, size] as const,
}

export const useAdminDashboardQuery = () =>
  useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: fetchAdminDashboard,
  })

export const useAdminWeeklyStatsQuery = () =>
  useQuery<AdminWeeklyStats>({
    queryKey: adminQueryKeys.weekly,
    queryFn: fetchAdminWeeklyStats,
  })

export const useAdminFloorStatsQuery = () =>
  useQuery<AdminFloorStatsResponse>({
    queryKey: adminQueryKeys.floors,
    queryFn: fetchAdminFloorStats,
  })

export const useAdminStoreStatsQuery = () =>
  useQuery<AdminStoreStats>({
    queryKey: adminQueryKeys.store,
    queryFn: fetchAdminStoreStats,
  })

export const useAdminCoinStatsQuery = () =>
  useQuery<AdminCoinStatsResponse>({
    queryKey: adminQueryKeys.coins,
    queryFn: fetchCoinStats,
  })

export const useAdminItemUsageStatsQuery = () =>
  useQuery<AdminItemUsageStatsResponse>({
    queryKey: adminQueryKeys.items,
    queryFn: fetchItemUsageStats,
  })

export const useAdminAttendanceStatsQuery = (startDate?: string, endDate?: string) =>
  useQuery<AdminAttendanceStat[]>({
    queryKey: adminQueryKeys.attendance(startDate, endDate),
    queryFn: () => fetchAdminAttendanceStats(startDate, endDate),
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

export const useAdminUsersQuery = (page = 0, size = 20, sort?: string) =>
  useQuery<AdminUserListPage>({
    queryKey: adminQueryKeys.users(page, size, sort ?? ''),
    queryFn: () => fetchAdminUsers(page, size, sort),
  })

export const useAdminCabinetDetailQuery = (visibleNum?: number) =>
  useQuery({
    queryKey: adminQueryKeys.cabinet(visibleNum),
    queryFn: () => {
      if (!visibleNum) throw new Error('visibleNum is required')
      return fetchCabinetDetail(visibleNum)
    },
    enabled: Boolean(visibleNum),
  })

export const useAdminPendingCabinetsQuery = () =>
  useQuery<AdminCabinetPendingItem[]>({
    queryKey: adminQueryKeys.pending,
    queryFn: fetchCabinetPendingList,
  })

export const useAdminOverdueCabinetsQuery = () =>
  useQuery<AdminOverdueUser[]>({
    queryKey: adminQueryKeys.overdue,
    queryFn: fetchOverdueUsers,
  })

export const useAdminPenaltyUsersQuery = () =>
  useQuery<AdminPenaltyUser[]>({
    queryKey: adminQueryKeys.penaltyUsers,
    queryFn: fetchPenaltyUsers,
  })

export const useAdminBrokenCabinetsQuery = () =>
  useQuery<AdminBrokenCabinet[]>({
    queryKey: adminQueryKeys.brokenCabinets,
    queryFn: fetchBrokenCabinets,
  })

export const useAdminCabinetHistoryQuery = (visibleNum?: number, page = 0, size = 10) =>
  useQuery<AdminCabinetHistoryPage>({
    queryKey: adminQueryKeys.history(visibleNum, page),
    queryFn: () => {
      if (!visibleNum) throw new Error('visibleNum is required')
      return fetchCabinetHistory(visibleNum, page, size)
    },
    enabled: Boolean(visibleNum),
  })

export const useAdminReturnPhotosQuery = (page = 0, size = 10) =>
  useQuery<AdminReturnPhotoPage>({
    queryKey: adminQueryKeys.returnPhotos(page, size),
    queryFn: () => fetchReturnPhotos(page, size),
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
      const description =
        error instanceof Error ? error.message : '코인 지급 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useCoinRevokeMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: CoinRevokeRequest }) =>
      revokeCoin(name, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '코인 회수 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '코인 회수 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const usePenaltyAssignMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: PenaltyAssignRequest }) =>
      assignPenalty(name, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '패널티 부여 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '패널티 부여 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const usePenaltyRemoveMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: (name: string) => removePenalty(name),
    onSuccess: (message) => {
      toast({ description: message ?? '패널티 해제 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '패널티 해제 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useItemGrantMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: ItemGrantRequest }) =>
      grantItem(name, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '아이템 지급 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '아이템 지급 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useItemRevokeMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ name, payload }: { name: string; payload: ItemRevokeRequest }) =>
      revokeItem(name, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '아이템 회수 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '아이템 회수 중 오류가 발생했습니다.'
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

export const useAdminRolePromoteMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: (name: string) => promoteAdminRole(name),
    onSuccess: (message) => {
      toast({ description: message ?? '관리자 권한 부여 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '관리자 권한 부여 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useAdminRoleDemoteMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: (name: string) => demoteAdminRole(name),
    onSuccess: (message) => {
      toast({ description: message ?? '관리자 권한 해제 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '관리자 권한 해제 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useCabinetStatusMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ visibleNum, payload }: { visibleNum: number; payload: CabinetStatusRequest }) =>
      updateCabinetStatus(visibleNum, payload),
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

export const useCabinetStatusBundleMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: (payload: CabinetStatusBundleRequest) => updateCabinetStatusBundle(payload),
    onSuccess: (message) => {
      toast({ description: message ?? '사물함 상태 일괄 변경 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '사물함 상태 일괄 변경 중 오류가 발생했습니다.'
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

export const usePendingCabinetApproveMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: (visibleNum: number) => approvePendingCabinet(visibleNum),
    onSuccess: (message) => {
      toast({ description: message ?? '수동 반납 승인 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '수동 반납 승인 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useItemPriceUpdateMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: ({ itemName, payload }: { itemName: string; payload: ItemPriceUpdateRequest }) =>
      updateItemPrice(itemName, payload),
    onSuccess: (message) => {
      toast({ description: message ?? '아이템 가격 변경 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '아이템 가격 변경 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}

export const useEmergencyNoticeMutation = () => {
  const toast = useAdminMutationToast()
  return useMutation({
    mutationFn: (payload: EmergencyNoticeRequest) => sendEmergencyNotice(payload),
    onSuccess: (message) => {
      toast({ description: message ?? '긴급 공지 발송 완료', status: 'success' })
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error ? error.message : '긴급 공지 발송 중 오류가 발생했습니다.'
      toast({ description, status: 'error' })
    },
  })
}
