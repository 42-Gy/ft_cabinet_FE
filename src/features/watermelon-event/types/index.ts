export type EnhanceOutcome = 'SUCCESS' | 'MAINTAIN' | 'DROP' | 'DESTROY'

export type EventShopItem =
  | 'DROP_PROTECTION'
  | 'DESTROY_PROTECTION'
  | 'PREMIUM_FERTILIZER'
  | 'DANGEROUS_FERTILIZER'

export interface WatermelonEventMe {
  userId: number
  username: string
  currentLevel: number
  highestLevel: number
  highestLevelAchievedAt: string | null
  seedBalance: number
  rank: number
  totalAttempts: number
  totalSuccesses: number
  totalMaintains: number
  totalDrops: number
  totalDestroys: number
  dropProtectionCount: number
  destroyProtectionCount: number
  premiumFertilizerCount: number
  dangerousFertilizerCount: number
}

export interface EnhanceRequest {
  usePremium: boolean
  useDangerous: boolean
  useDropProj: boolean
  useDestroyProj: boolean
}

export interface EnhanceResult {
  beforeLevel: number
  afterLevel: number
  rawOutcome: EnhanceOutcome
  finalOutcome: EnhanceOutcome
  seedBalance: number
  dropProtectionCount: number
  destroyProtectionCount: number
  premiumFertilizerCount: number
  dangerousFertilizerCount: number
}

export interface BuyEventItemRequest {
  item: EventShopItem
  quantity: number
}

export interface EventInventoryResult {
  seedBalance: number
  dropProtectionCount: number
  destroyProtectionCount: number
  premiumFertilizerCount: number
  dangerousFertilizerCount: number
}

export interface RankingEntry {
  userId: number
  username: string
  highestLevel: number
  highestLevelAchievedAt: string | null
  totalAttempts: number
}

export interface RankingPage {
  content: RankingEntry[]
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  numberOfElements: number
  first: boolean
  empty: boolean
}

export interface EnhanceLog {
  id: number
  userId: number
  beforeLevel: number
  afterLevel: number
  usedPremiumFertilizer: boolean
  usedDangerousFertilizer: boolean
  usedDropProtection: boolean
  usedDestroyProtection: boolean
  rawOutcome: EnhanceOutcome
  finalOutcome: EnhanceOutcome
  costSeeds: number
  createdAt: string
}

export interface WatermelonEventConfig {
  maxLevel: number
  enhanceCosts: number[]
  successRates: number[]
  maintainRates: number[]
  dropRates: number[]
  destroyRates: number[]
  itemPrices: Record<EventShopItem, number>
}

export type EnhanceAnimationState =
  | 'IDLE'
  | 'ENHANCING'
  | 'SUCCESS'
  | 'MAINTAIN'
  | 'DROP'
  | 'DESTROY'

