export interface AdminDashboardStats {
  totalUserCount: number
  totalCabinetCount: number
  activeLentCount: number
  brokenCabinetCount: number
  bannedUserCount: number
}

export interface AdminUserDetail {
  userId: number
  name: string
  email: string
  coin: number
  penaltyDays: number
  monthlyLogtime: number
  lentCabinetId?: number | null
  visibleNum?: number | null
  section?: string | null
}

export interface CoinProvideRequest {
  amount: number
  reason: string
}

export interface LogtimeUpdateRequest {
  monthlyLogtime: number
}

export type CabinetStatusValue = 'AVAILABLE' | 'BROKEN' | 'FULL' | 'OVERDUE'
export type CabinetLentType = 'PRIVATE' | 'SHARE' | 'CLUB'

export interface CabinetStatusRequest {
  status: CabinetStatusValue
  lentType: CabinetLentType
  statusNote?: string
}
