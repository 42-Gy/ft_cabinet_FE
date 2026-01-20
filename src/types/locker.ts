export type CabinetStatus = 'AVAILABLE' | 'FULL' | 'BROKEN' | 'OVERDUE' | 'DISABLED' | 'PENDING'

export interface Cabinet {
  cabinetId: number
  visibleNum: number
  floor: number
  section: string
  lentType?: string
  status: CabinetStatus
  statusNote?: string
  lentUserName?: string
  lentStartedAt?: string
  lentExpiredAt?: string
  daysRemaining?: number
}

export interface CabinetSummary {
  section: string
  total: number
  availableCount: number
  fullCount: number
  brokenCount: number
}

export interface CabinetSummaryAll {
  totalCounts: number
  totalAvailable: number
  totalFull: number
  totalBroken: number
}

export type SectionDirection = 'north' | 'south' | 'east' | 'west'

export interface LockerSectionMeta {
  id: number
  floor: number
  title: string
  description: string
  direction?: SectionDirection
  directionLabel?: string
}

export interface LockerSectionData extends LockerSectionMeta {
  cabinets: Cabinet[]
}

export interface LockerActionResult {
  message: string
}

export interface CabinetDetail {
  cabinetId: number
  visibleNum: number
  floor: number
  section: string
  status: CabinetStatus
  statusNote?: string
  lentUserName?: string
  lentStartedAt?: string
  lentExpiredAt?: string
  previousUserName?: string
  previousEndedAt?: string
}
