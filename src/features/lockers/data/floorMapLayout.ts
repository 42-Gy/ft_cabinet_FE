interface AreaConfig {
  x: number
  y: number
  width: number
  height: number
  color: string
  label: string
}

interface SectionAreaConfig {
  sectionId: number
  x: number
  y: number
  width: number
  height: number
}

interface FloorMapConfig {
  width: number
  height: number
  areas: AreaConfig[]
  sections: SectionAreaConfig[]
}

export const floorMapLayouts: Record<number, FloorMapConfig> = {
  2: {
    width: 10,
    height: 10,
    areas: [
      { x: 0, y: 0, width: 10, height: 1, color: '#dbeafe', label: '오아시스' },
      { x: 0, y: 9, width: 10, height: 1, color: '#ede9fe', label: '1클러스터' },
    ],
    sections: [
      { sectionId: 1, x: 1, y: 9, width: 5, height: 1 },
      { sectionId: 2, x: 2, y: 4, width: 6, height: 2 },
      { sectionId: 3, x: 0, y: 3, width: 1, height: 5 },
      { sectionId: 4, x: 6, y: 2, width: 1, height: 7 },
    ],
  },
  3: {
    width: 10,
    height: 10,
    areas: [
      { x: 0, y: 0, width: 10, height: 1, color: '#cffafe', label: '2클러스터 앞' },
      { x: 0, y: 9, width: 10, height: 1, color: '#fee2e2', label: '카페 라운지' },
    ],
    sections: [
      { sectionId: 5, x: 2, y: 0, width: 6, height: 1 },
      { sectionId: 6, x: 0, y: 2, width: 1, height: 6 },
      { sectionId: 7, x: 3, y: 8, width: 4, height: 1 },
    ],
  },
}
