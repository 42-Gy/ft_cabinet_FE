import { apiClient } from '@/libs/axios/client'
import { unwrapApiResponse } from '@/libs/axios/unwrap'
import type {
  BuyEventItemRequest,
  EnhanceLog,
  EnhanceRequest,
  EnhanceResult,
  EventInventoryResult,
  RankingPage,
  WatermelonEventConfig,
  WatermelonEventMe,
} from '@/features/watermelon-event/types'

const baseUrl = '/v4/watermelon-event'

export const getWatermelonEventMe = async () => {
  const { data } = await apiClient.get(`${baseUrl}/me`)
  return unwrapApiResponse<WatermelonEventMe>(data)
}

export const enhanceWatermelon = async (payload: EnhanceRequest) => {
  const { data } = await apiClient.post(`${baseUrl}/enhance`, payload)
  return unwrapApiResponse<EnhanceResult>(data)
}

export const buyWatermelonEventItem = async (payload: BuyEventItemRequest) => {
  const { data } = await apiClient.post(`${baseUrl}/shop/buy`, payload)
  return unwrapApiResponse<EventInventoryResult>(data)
}

export const getWatermelonEventRankings = async (page = 0, size = 10) => {
  const { data } = await apiClient.get(`${baseUrl}/rankings`, {
    params: { page, size },
  })
  return unwrapApiResponse<RankingPage>(data)
}

export const getWatermelonEventLogs = async () => {
  const { data } = await apiClient.get(`${baseUrl}/logs`)
  return unwrapApiResponse<EnhanceLog[]>(data)
}

export const getWatermelonEventConfig = async () => {
  const { data } = await apiClient.get(`${baseUrl}/config`)
  return unwrapApiResponse<WatermelonEventConfig>(data)
}

