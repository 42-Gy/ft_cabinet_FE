import { apiClient } from '@/libs/axios/client'
import type {
  AdminDashboardStats,
  AdminUserDetail,
  CabinetStatusRequest,
  CoinProvideRequest,
  LogtimeUpdateRequest,
} from '@/features/admin/types'

const BASE_PATH = '/v4/admin'

export const fetchAdminDashboard = async (): Promise<AdminDashboardStats> => {
  const { data } = await apiClient.get<AdminDashboardStats>(`${BASE_PATH}/dashboard`)
  return data
}

export const fetchAdminUserDetail = async (name: string): Promise<AdminUserDetail> => {
  const { data } = await apiClient.get<AdminUserDetail>(`${BASE_PATH}/users/${name}`)
  return data
}

export const provideCoin = async (name: string, payload: CoinProvideRequest): Promise<string> => {
  const { data } = await apiClient.post<string>(`${BASE_PATH}/users/${name}/coin`, payload)
  return data
}

export const updateLogtime = async (
  name: string,
  payload: LogtimeUpdateRequest,
): Promise<string> => {
  const { data } = await apiClient.patch<string>(`${BASE_PATH}/users/${name}/logtime`, payload)
  return data
}

export const updateCabinetStatus = async (
  visibleNum: number,
  payload: CabinetStatusRequest,
): Promise<string> => {
  const { data } = await apiClient.patch<string>(
    `${BASE_PATH}/cabinets/${visibleNum}`,
    payload,
  )
  return data
}

export const forceReturnCabinet = async (visibleNum: number): Promise<string> => {
  const { data } = await apiClient.post<string>(
    `${BASE_PATH}/cabinets/${visibleNum}/force-return`,
    {},
  )
  return data
}
