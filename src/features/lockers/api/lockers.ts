import { apiClient, publicClient } from '@/libs/axios/client'
import { coerceArray, unwrapApiResponse } from '@/libs/axios/unwrap'
import { resolveCabinetId } from '@/features/lockers/libs/cabinetIdResolver'
import type {
  Cabinet,
  CabinetDetail,
  CabinetSummary,
  CabinetSummaryAll,
  LockerActionResult,
} from '@/types/locker'

const toActionResult = (data: unknown): LockerActionResult => {
  if (typeof data === 'string') {
    return { message: data }
  }
  if (data && typeof data === 'object') {
    if ('message' in data) {
      return { message: String((data as { message?: string }).message) }
    }
    if ('data' in data && (data as { data?: { message?: string } }).data?.message) {
      return { message: String((data as { data?: { message?: string } }).data?.message) }
    }
  }
  return { message: '요청이 완료되었습니다.' }
}

interface CabinetRequestOptions {
  publicAccess?: boolean
}

export const getCabinets = async (
  floor: number,
  options?: CabinetRequestOptions,
): Promise<Cabinet[]> => {
  const client = options?.publicAccess ? publicClient : apiClient
  const { data } = await client.get('/v4/cabinets', { params: { floor } })
  return coerceArray<Cabinet>(unwrapApiResponse<unknown>(data))
}

export const getCabinetSummary = async (floor: number): Promise<CabinetSummary[]> => {
  const { data } = await apiClient.get('/v4/cabinets/status-summary', {
    params: { floor },
  })
  return coerceArray<CabinetSummary>(unwrapApiResponse<unknown>(data))
}

export const getCabinetSummaryAll = async (): Promise<CabinetSummaryAll> => {
  const { data } = await publicClient.get('/v4/cabinets/status-summary/all')
  const payload = unwrapApiResponse<unknown>(data)
  if (!payload || typeof payload !== 'object') {
    return { totalCounts: 0, totalAvailable: 0, totalFull: 0, totalBroken: 0 }
  }
  const summary = payload as Partial<CabinetSummaryAll>
  return {
    totalCounts: summary.totalCounts ?? 0,
    totalAvailable: summary.totalAvailable ?? 0,
    totalFull: summary.totalFull ?? 0,
    totalBroken: summary.totalBroken ?? 0,
  }
}

export const getCabinetDetail = async (cabinetId: number): Promise<CabinetDetail> => {
  const resolvedId = resolveCabinetId(cabinetId)
  const { data } = await publicClient.get(`/v4/cabinets/${resolvedId}`)
  return unwrapApiResponse<CabinetDetail>(data)
}

export const rentCabinet = async (cabinetId: number): Promise<LockerActionResult> => {
  const resolvedId = resolveCabinetId(cabinetId)
  const { data } = await apiClient.post(`/v4/lent/cabinets/${resolvedId}`, {})
  return toActionResult(data)
}

export interface ReturnCabinetPayload {
  file: File
  previousPassword: string
  forceReturn: boolean
  reason?: string
}

export const returnCabinet = async (
  payload: ReturnCabinetPayload,
): Promise<LockerActionResult> => {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('previousPassword', payload.previousPassword)
  formData.append('forceReturn', String(payload.forceReturn))
  if (payload.reason) {
    formData.append('reason', payload.reason)
  }

  const { data } = await apiClient.post('/v4/lent/return', formData)
  if (typeof data === 'object' && data && 'message' in data) {
    return { message: String((data as { message?: string }).message) }
  }
  return toActionResult(data)
}

export const checkReturnImage = async (file: File): Promise<LockerActionResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await apiClient.post('/v4/lent/check-image', formData)
  return toActionResult(data)
}

export const buyStoreItem = async (itemId: number): Promise<LockerActionResult> => {
  const { data } = await apiClient.post(`/v4/store/buy/${itemId}`, {})
  return toActionResult(data)
}

export const useExtensionTicket = async (): Promise<LockerActionResult> => {
  const { data } = await apiClient.post('/v4/lent/extension', {})
  return toActionResult(data)
}

export const useSwapTicket = async (newCabinetId: number): Promise<LockerActionResult> => {
  const resolvedId = resolveCabinetId(newCabinetId)
  const { data } = await apiClient.post(`/v4/lent/swap/${resolvedId}`, {})
  return toActionResult(data)
}

export const usePenaltyTicket = async (): Promise<LockerActionResult> => {
  const { data } = await apiClient.post('/v4/lent/penalty-exemption', {})
  return toActionResult(data)
}

export const updateAutoExtension = async (
  enabled: boolean,
): Promise<LockerActionResult> => {
  const { data } = await apiClient.patch('/v4/lent/extension/auto', { enabled })
  if (typeof data === 'object' && data && 'data' in data) {
    const nested = (data as { data?: { message?: string } }).data?.message
    return { message: nested ?? '자동 연장 설정이 변경되었습니다.' }
  }
  return toActionResult(data)
}
