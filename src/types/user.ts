export type UserItemType = 'LENT' | 'EXTENSION' | 'SWAP' | 'PENALTY_EXEMPTION'

export interface UserItem {
  itemHistoryId: number
  itemName: string
  itemType: UserItemType
  purchaseAt: string
}

export type CoinHistoryType = 'SPEND' | 'EARN'

export interface CoinHistory {
  date: string
  amount: number
  type: CoinHistoryType
  reason?: string | null
}

export type ItemHistoryStatus = 'UNUSED' | 'USED'

export interface ItemHistory {
  date: string
  itemName: string
  itemType: UserItemType
  status: ItemHistoryStatus
  usedAt?: string | null
}

export interface UserProfile {
  userId: number
  name: string
  email: string
  role?: string | null
  coin: number
  penaltyDays: number
  monthlyLogtime: number
  lentCabinetId?: number | null
  visibleNum?: number | null
  section?: string | null
  previousPassword?: string | null
  lentStartedAt?: string | null
  expiredAt?: string | null
  lentExpiredAt?: string | null
  autoExtensionEnabled?: boolean | null
  myItems: UserItem[]
  coinHistories?: CoinHistory[]
  itemHistories?: ItemHistory[]
}
