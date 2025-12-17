export interface UserItem {
  itemHistoryId: number
  itemName: string
  purchaseAt: string
}

export interface UserProfile {
  userId: number
  name: string
  email: string
  coin: number
  lentCabinetId?: number | null
  visibleNum?: number | null
  section?: string | null
  lentStartedAt?: string | null
  lentExpiredAt?: string | null
  myItems: UserItem[]
}
