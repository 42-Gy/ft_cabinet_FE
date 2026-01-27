import { apiClient } from '@/libs/axios/client'
import { unwrapApiResponse } from '@/libs/axios/unwrap'
import type {
  AdminAttendanceStat,
  AdminCabinetDetail,
  AdminCabinetHistoryPage,
  AdminCabinetPendingItem,
  AdminDashboardStats,
  AdminFloorStatsResponse,
  AdminPenaltyUser,
  AdminBrokenCabinet,
  AdminOverdueUser,
  AdminCoinStatsResponse,
  AdminItemUsageStatsResponse,
  AdminStoreStats,
  AdminUserDetail,
  AdminWeeklyStats,
  CabinetStatusBundleRequest,
  CabinetStatusRequest,
  CoinProvideRequest,
  CoinRevokeRequest,
  EmergencyNoticeRequest,
  ItemGrantRequest,
  ItemRevokeRequest,
  ItemPriceUpdateRequest,
  LogtimeUpdateRequest,
  PenaltyAssignRequest,
} from '@/features/admin/types'

const BASE_PATH = '/v4/admin'

export const fetchAdminDashboard = async (): Promise<AdminDashboardStats> => {
  const { data } = await apiClient.get(`${BASE_PATH}/dashboard`)
  return unwrapApiResponse<AdminDashboardStats>(data)
}

export const fetchAdminUserDetail = async (name: string): Promise<AdminUserDetail> => {
  const { data } = await apiClient.get(`${BASE_PATH}/users/${name}`)
  return unwrapApiResponse<AdminUserDetail>(data)
}

export const fetchAdminFloorStats = async (): Promise<AdminFloorStatsResponse> => {
  const { data } = await apiClient.get(`${BASE_PATH}/stats/floors`)
  return unwrapApiResponse<AdminFloorStatsResponse>(data)
}

export const fetchAdminWeeklyStats = async (): Promise<AdminWeeklyStats> => {
  const { data } = await apiClient.get(`${BASE_PATH}/stats/weekly`)
  return unwrapApiResponse<AdminWeeklyStats>(data)
}

export const fetchAdminStoreStats = async (): Promise<AdminStoreStats> => {
  const { data } = await apiClient.get(`${BASE_PATH}/stats/store`)
  return unwrapApiResponse<AdminStoreStats>(data)
}

export const fetchAdminAttendanceStats = async (
  startDate?: string,
  endDate?: string,
): Promise<AdminAttendanceStat[]> => {
  const { data } = await apiClient.get(`${BASE_PATH}/stats/attendance`, {
    params: { startDate, endDate },
  })
  return unwrapApiResponse<AdminAttendanceStat[]>(data)
}

export const provideCoin = async (name: string, payload: CoinProvideRequest): Promise<string> => {
  const { data } = await apiClient.post(`${BASE_PATH}/users/${name}/coin`, payload)
  return unwrapApiResponse<string>(data)
}

export const revokeCoin = async (name: string, payload: CoinRevokeRequest): Promise<string> => {
  const { data } = await apiClient.delete(`${BASE_PATH}/users/${name}/coin`, { data: payload })
  return unwrapApiResponse<string>(data)
}

export const assignPenalty = async (
  name: string,
  payload: PenaltyAssignRequest,
): Promise<string> => {
  const { data } = await apiClient.post(`${BASE_PATH}/users/${name}/penalty`, payload)
  return unwrapApiResponse<string>(data)
}

export const removePenalty = async (name: string): Promise<string> => {
  const { data } = await apiClient.delete(`${BASE_PATH}/users/${name}/penalty`)
  return unwrapApiResponse<string>(data)
}

export const grantItem = async (name: string, payload: ItemGrantRequest): Promise<string> => {
  const { data } = await apiClient.post(`${BASE_PATH}/users/${name}/items`, payload)
  return unwrapApiResponse<string>(data)
}

export const revokeItem = async (name: string, payload: ItemRevokeRequest): Promise<string> => {
  const { data } = await apiClient.delete(`${BASE_PATH}/users/${name}/items`, { data: payload })
  return unwrapApiResponse<string>(data)
}

export const fetchPenaltyUsers = async (): Promise<AdminPenaltyUser[]> => {
  const { data } = await apiClient.get(`${BASE_PATH}/users/penalty`)
  return unwrapApiResponse<AdminPenaltyUser[]>(data)
}

export const updateLogtime = async (
  name: string,
  payload: LogtimeUpdateRequest,
): Promise<string> => {
  const { data } = await apiClient.patch(`${BASE_PATH}/users/${name}/logtime`, payload)
  return unwrapApiResponse<string>(data)
}

export const promoteAdminRole = async (name: string): Promise<string> => {
  const { data } = await apiClient.post(`${BASE_PATH}/users/${name}/role/admin`, {})
  return unwrapApiResponse<string>(data)
}

export const demoteAdminRole = async (name: string): Promise<string> => {
  const { data } = await apiClient.delete(`${BASE_PATH}/users/${name}/role/admin`)
  return unwrapApiResponse<string>(data)
}

export const updateCabinetStatus = async (
  visibleNum: number,
  payload: CabinetStatusRequest,
): Promise<string> => {
  const { data } = await apiClient.patch(
    `${BASE_PATH}/cabinets/${visibleNum}`,
    payload,
  )
  return unwrapApiResponse<string>(data)
}

export const updateCabinetStatusBundle = async (
  payload: CabinetStatusBundleRequest,
): Promise<string> => {
  const { data } = await apiClient.patch(`${BASE_PATH}/cabinets/bundle/status`, payload)
  return unwrapApiResponse<string>(data)
}

export const forceReturnCabinet = async (visibleNum: number): Promise<string> => {
  const { data } = await apiClient.post(
    `${BASE_PATH}/cabinets/${visibleNum}/force-return`,
    {},
  )
  return unwrapApiResponse<string>(data)
}

export const fetchCabinetDetail = async (visibleNum: number): Promise<AdminCabinetDetail> => {
  const { data } = await apiClient.get(`${BASE_PATH}/cabinets/${visibleNum}`)
  return unwrapApiResponse<AdminCabinetDetail>(data)
}

export const fetchCabinetPendingList = async (): Promise<AdminCabinetPendingItem[]> => {
  const { data } = await apiClient.get(`${BASE_PATH}/cabinets/pending`)
  return unwrapApiResponse<AdminCabinetPendingItem[]>(data)
}

export const approvePendingCabinet = async (visibleNum: number): Promise<string> => {
  const { data } = await apiClient.post(`${BASE_PATH}/cabinets/${visibleNum}/approve`, {})
  return unwrapApiResponse<string>(data)
}

export const fetchCabinetHistory = async (
  visibleNum: number,
  page = 0,
  size = 10,
): Promise<AdminCabinetHistoryPage> => {
  const { data } = await apiClient.get(`${BASE_PATH}/cabinets/${visibleNum}/history`, {
    params: { page, size },
  })
  return unwrapApiResponse<AdminCabinetHistoryPage>(data)
}

export const fetchOverdueUsers = async (): Promise<AdminOverdueUser[]> => {
  const { data } = await apiClient.get(`${BASE_PATH}/cabinets/overdue`)
  return unwrapApiResponse<AdminOverdueUser[]>(data)
}

export const fetchBrokenCabinets = async (): Promise<AdminBrokenCabinet[]> => {
  const { data } = await apiClient.get(`${BASE_PATH}/cabinets/broken`)
  return unwrapApiResponse<AdminBrokenCabinet[]>(data)
}

export const fetchCoinStats = async (): Promise<AdminCoinStatsResponse> => {
  const { data } = await apiClient.get(`${BASE_PATH}/stats/coins`)
  return unwrapApiResponse<AdminCoinStatsResponse>(data)
}

export const fetchItemUsageStats = async (): Promise<AdminItemUsageStatsResponse> => {
  const { data } = await apiClient.get(`${BASE_PATH}/stats/items`)
  return unwrapApiResponse<AdminItemUsageStatsResponse>(data)
}

export const updateItemPrice = async (
  itemName: string,
  payload: ItemPriceUpdateRequest,
): Promise<string> => {
  const { data } = await apiClient.patch(`${BASE_PATH}/items/${itemName}/price`, payload)
  return unwrapApiResponse<string>(data)
}

export const sendEmergencyNotice = async (payload: EmergencyNoticeRequest): Promise<string> => {
  const { data } = await apiClient.post(`${BASE_PATH}/alarm/emergency`, payload)
  return unwrapApiResponse<string>(data)
}
