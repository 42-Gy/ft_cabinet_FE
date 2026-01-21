export interface AdminDashboardStats {
  totalUserCount: number
  totalCabinetCount: number
  activeLentCount: number
  brokenCabinetCount: number
  bannedUserCount: number
}

export interface AdminUserDetail {
  id: number
  name: string
  email: string
  coin: number
  penaltyDays: number
  monthlyLogtime: number
  blackholedAt?: string | null
  role?: string | null
  currentCabinetNum?: number | null
}

export interface CoinProvideRequest {
  amount: number
  reason: string
}

export interface PenaltyAssignRequest {
  penaltyDays: number
  reason: string
}

export interface ItemGrantRequest {
  itemName: string
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

export interface AdminWeeklyStats {
  lentsStarted: number
  lentsEnded: number
}

export interface AdminStoreStats {
  totalUserCoins: number
  totalUsedCoins: number
  itemSales: {
    extensionTicket: number
    swapTicket: number
    alarm: number
  }
}

export interface AdminAttendanceStat {
  date: string
  count: number
}

export interface AdminCabinetDetail {
  cabinetId: number
  visibleNum: number
  status: CabinetStatusValue
  lentType: CabinetLentType
  maxUser: number
  section: string
  location: string
  title?: string | null
  currentUserName?: string | null
  currentUserId?: number | null
}

export interface AdminCabinetPendingItem {
  visibleNum: number
  statusNote?: string | null
  photoUrl?: string | null
  intraId?: string | null
  lentType?: CabinetLentType | null
}

export interface AdminCabinetHistoryItem {
  lentHistoryId: number
  userName: string
  startedAt: string
  endedAt?: string | null
}

export interface AdminCabinetHistoryPage {
  content: AdminCabinetHistoryItem[]
  totalPages: number
  totalElements: number
}

export interface AdminOverdueUser {
  userId: number
  name: string
  visibleNum: number
  overdueDays: number
}

export interface ItemPriceUpdateRequest {
  price: number
}

export interface EmergencyNoticeRequest {
  message: string
}
