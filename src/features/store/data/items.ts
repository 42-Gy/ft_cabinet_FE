export const STORE_ITEM_IDS = {
  RENT: 1,
  EXTEND: 2,
  MOVE: 3,
  PENALTY_REDUCE: 4,
} as const

export type StoreItemKey = keyof typeof STORE_ITEM_IDS

export interface StoreItem {
  key: StoreItemKey
  title: string
  description: string
  priceLabel: string
  itemId: number
}

export const STORE_ITEMS: StoreItem[] = [
  {
    key: 'RENT',
    title: '대여권',
    description: '새 사물함을 빌릴 수 있는 기본 이용권입니다.',
    priceLabel: '100 코인',
    itemId: STORE_ITEM_IDS.RENT,
  },
  {
    key: 'EXTEND',
    title: '연장권',
    description: '현재 사용 중인 사물함을 기간 연장할 수 있어요.',
    priceLabel: '80 코인',
    itemId: STORE_ITEM_IDS.EXTEND,
  },
  {
    key: 'MOVE',
    title: '이사권',
    description: '다른 섹션으로 이동하고 싶을 때 사용하는 교체권입니다.',
    priceLabel: '60 코인',
    itemId: STORE_ITEM_IDS.MOVE,
  },
  {
    key: 'PENALTY_REDUCE',
    title: '패널티 감면권',
    description: '연체/패널티를 한 번 면제받을 수 있는 티켓입니다.',
    priceLabel: '40 코인',
    itemId: STORE_ITEM_IDS.PENALTY_REDUCE,
  },
]
