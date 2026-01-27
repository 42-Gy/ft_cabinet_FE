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
  itemCounts?: Partial<Record<AdminItemType, number>>
  blackholedAt?: string | null
  role?: string | null
  currentCabinetNum?: number | null
}

export interface CoinProvideRequest {
  amount: number
  reason: string
}

export interface CoinRevokeRequest {
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

export interface ItemRevokeRequest {
  itemName: string
  amount?: number | null
}

export interface LogtimeUpdateRequest {
  monthlyLogtime: number
}

export type CabinetStatusValue =
  | 'AVAILABLE'
  | 'BROKEN'
  | 'FULL'
  | 'OVERDUE'
  | 'DISABLED'
  | 'PENDING'
export type CabinetLentType = 'PRIVATE' | 'SHARE' | 'CLUB'
export type AdminItemType = 'LENT' | 'EXTENSION' | 'SWAP' | 'PENALTY_EXEMPTION'

export interface CabinetStatusRequest {
  status: CabinetStatusValue
  lentType: CabinetLentType
  statusNote?: string
}

export interface AdminWeeklyStatsPoint {
  weekLabel: string
  startDate: string
  endDate: string
  lentsStarted: number
  lentsEnded: number
}

export interface AdminWeeklyStats {
  weeklyData: AdminWeeklyStatsPoint[]
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

export interface AdminFloorStatsItem {
  floor: number
  total: number
  used: number
  available: number
  overdue: number
  broken: number
  pending: number
  disabled?: number
}

export interface AdminFloorStatsResponse {
  floors: AdminFloorStatsItem[]
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

export interface AdminPenaltyUser {
  userId: number
  name: string
  penaltyDays: number
  penaltyEndDate: string
}

export interface AdminBrokenCabinet {
  cabinetId: number
  visibleNum: number
  floor: number
  section: string
  statusNote?: string | null
}

export interface CabinetStatusBundleRequest {
  cabinetIds: number[]
  status: CabinetStatusValue
  statusNote?: string
}

export interface ItemPriceUpdateRequest {
  price: number
}

export interface EmergencyNoticeRequest {
  message: string
}

export interface AdminCoinStatsPoint {
  weekLabel: string
  startDate: string
  endDate: string
  issuedAmount: number
  usedAmount: number
}

export interface AdminCoinStatsResponse {
  weeklyData: AdminCoinStatsPoint[]
}

export interface AdminItemUsageStat {
  itemName: string
  itemType: AdminItemType
  purchaseCount: number
  usedCount: number
}

export interface AdminItemUsageStatsResponse {
  itemStats: AdminItemUsageStat[]
  attendanceRewardsCount: number
  watermelonRewardsCount: number
}
