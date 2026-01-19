import { apiClient } from '@/libs/axios/client'
import { unwrapApiResponse } from '@/libs/axios/unwrap'
import type {
  AdminDashboardStats,
  AdminUserDetail,
  CabinetStatusRequest,
  CoinProvideRequest,
  LogtimeUpdateRequest,
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

export const provideCoin = async (name: string, payload: CoinProvideRequest): Promise<string> => {
  const { data } = await apiClient.post(`${BASE_PATH}/users/${name}/coin`, payload)
  return unwrapApiResponse<string>(data)
}

export const updateLogtime = async (
  name: string,
  payload: LogtimeUpdateRequest,
): Promise<string> => {
  const { data } = await apiClient.patch(`${BASE_PATH}/users/${name}/logtime`, payload)
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

export const forceReturnCabinet = async (visibleNum: number): Promise<string> => {
  const { data } = await apiClient.post(
    `${BASE_PATH}/cabinets/${visibleNum}/force-return`,
    {},
  )
  return unwrapApiResponse<string>(data)
}
