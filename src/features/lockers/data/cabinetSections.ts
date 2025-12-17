import type { LockerSectionMeta } from '@/types/locker'

export interface CabinetRange {
  start: number
  end: number
  count: number
  description?: string
}

export interface CabinetSectionConfig extends LockerSectionMeta {
  ranges: CabinetRange[]
}

export const cabinetSections: CabinetSectionConfig[] = [
  {
    id: 1,
    floor: 2,
    title: '섹션 1 (1클러스터 앞)',
    description: '64개 2045~2108',
    direction: 'north',
    directionLabel: '북측',
    ranges: [{ start: 2045, end: 2108, count: 64 }],
  },
  {
    id: 2,
    floor: 2,
    title: '섹션 2',
    description: '2037~2044 (8), 2013~2036 (24), 2001~2012 (12)',
    direction: 'west',
    ranges: [
      { start: 2037, end: 2044, count: 8 },
      { start: 2013, end: 2036, count: 24 },
      { start: 2001, end: 2012, count: 12 },
    ],
  },
  {
    id: 3,
    floor: 2,
    title: '섹션 3',
    description: '2109~2116 (8), 2117~2132 (16)',
    direction: 'east',
    ranges: [
      { start: 2109, end: 2116, count: 8 },
      { start: 2117, end: 2132, count: 16 },
    ],
  },
  {
    id: 4,
    floor: 2,
    title: '섹션 4 (오아시스 앞)',
    description: '2165~2168 (4), 2133~2164 (32)',
    direction: 'south',
    directionLabel: '남측',
    ranges: [
      { start: 2165, end: 2168, count: 4 },
      { start: 2133, end: 2164, count: 32 },
    ],
  },
  {
    id: 5,
    floor: 3,
    title: '섹션 5 (2클러스터 앞)',
    description: '3045~3104 (60)',
    direction: 'north',
    ranges: [{ start: 3045, end: 3104, count: 60 }],
  },
  {
    id: 6,
    floor: 3,
    title: '섹션 6',
    description: '3037~3044 (8), 3013~3036 (24), 3001~3012 (12)',
    direction: 'west',
    ranges: [
      { start: 3037, end: 3044, count: 8 },
      { start: 3013, end: 3036, count: 24 },
      { start: 3001, end: 3012, count: 12 },
    ],
  },
  {
    id: 7,
    floor: 3,
    title: '섹션 7',
    description: '3113~3136 (24), 3105~3112 (8)',
    direction: 'south',
    ranges: [
      { start: 3113, end: 3136, count: 24 },
      { start: 3105, end: 3112, count: 8 },
    ],
  },
]

const sectionMap = new Map<number, CabinetSectionConfig>(cabinetSections.map((section) => [section.id, section]))

export const extractSectionId = (label?: string | number | null) => {
  if (typeof label === 'number' && !Number.isNaN(label)) return label
  if (!label) return null
  const match = `${label}`.match(/(\d+)/)
  return match ? Number(match[1]) : null
}

export const getSectionById = (id?: number | null) => {
  if (!id) return undefined
  return sectionMap.get(id)
}

export const getSectionByLabel = (label?: string | number | null) => {
  const id = extractSectionId(label)
  return getSectionById(id ?? undefined)
}

export const getSectionsByFloor = (floor: number) => cabinetSections.filter((section) => section.floor === floor)

export const lockerFloors = Array.from(new Set(cabinetSections.map((section) => section.floor))).sort((a, b) => a - b)
