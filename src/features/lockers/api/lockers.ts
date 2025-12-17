import { apiClient, publicClient } from '@/libs/axios/client'
import { resolveCabinetId } from '@/features/lockers/libs/cabinetIdResolver'
import type {
  Cabinet,
  CabinetDetail,
  CabinetSummary,
  CabinetSummaryAll,
  LockerActionResult,
} from '@/types/locker'

const toActionResult = (data: unknown): LockerActionResult => ({
  message: typeof data === 'string' ? data : '요청이 완료되었습니다.',
})

interface CabinetRequestOptions {
  publicAccess?: boolean
}

export const getCabinets = async (
  floor: number,
  options?: CabinetRequestOptions,
): Promise<Cabinet[]> => {
  const client = options?.publicAccess ? publicClient : apiClient
  const { data } = await client.get<Cabinet[]>('/v4/cabinets', { params: { floor } })
  return data
}

export const getCabinetSummary = async (floor: number): Promise<CabinetSummary[]> => {
  const { data } = await apiClient.get<CabinetSummary[]>('/v4/cabinets/status-summary', {
    params: { floor },
  })
  return data
}

export const getCabinetSummaryAll = async (): Promise<CabinetSummaryAll> => {
  const { data } = await publicClient.get<CabinetSummaryAll>('/v4/cabinets/status-summary/all')
  return data
}

export const getCabinetDetail = async (cabinetId: number): Promise<CabinetDetail> => {
  const resolvedId = resolveCabinetId(cabinetId)
  const { data } = await publicClient.get<CabinetDetail>(`/v4/cabinets/${resolvedId}`)
  return data
}

export const rentCabinet = async (cabinetId: number): Promise<LockerActionResult> => {
  const resolvedId = resolveCabinetId(cabinetId)
  const { data } = await apiClient.post(`/v4/lent/cabinets/${resolvedId}`, {})
  return toActionResult(data)
}

export const returnCabinet = async (): Promise<LockerActionResult> => {
  const { data } = await apiClient.post('/v4/lent/return', {})
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
