import { apiClient } from '@/libs/axios/client'
import { coerceArray, unwrapApiResponse } from '@/libs/axios/unwrap'
import type { StoreItemResponse } from '@/features/store/types'

export const fetchStoreItems = async (): Promise<StoreItemResponse[]> => {
  const { data } = await apiClient.get('/v4/store/items')
  return coerceArray<StoreItemResponse>(unwrapApiResponse<unknown>(data))
}
