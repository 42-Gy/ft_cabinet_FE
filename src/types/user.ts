export type UserItemType = 'LENT' | 'EXTENSION' | 'SWAP' | 'PENALTY_EXEMPTION'

export interface UserItem {
  itemHistoryId: number
  itemName: string
  itemType: UserItemType
  purchaseAt: string
}

export interface UserProfile {
  userId: number
  name: string
  email: string
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
  myItems: UserItem[]
}
