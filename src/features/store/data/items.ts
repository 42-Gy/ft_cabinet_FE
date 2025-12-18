import type { IconType } from 'react-icons'
import {
  RiExchangeLine,
  RiShieldCheckLine,
  RiTicket2Line,
  RiTimerLine,
} from 'react-icons/ri'

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
  icon: IconType
  disabled?: boolean
}

export const STORE_ITEMS: StoreItem[] = [
  {
    key: 'RENT',
    title: '대여권',
    description: '출석/미션 보상 전용. 스토어에서 구매할 수 없습니다.',
    priceLabel: '구매 불가',
    itemId: STORE_ITEM_IDS.RENT,
    icon: RiTicket2Line,
    disabled: true,
  },
  {
    key: 'EXTEND',
    title: '연장권',
    description: '현재 사물함을 15일 연장합니다.',
    priceLabel: '1,000 수박씨',
    itemId: STORE_ITEM_IDS.EXTEND,
    icon: RiTimerLine,
  },
  {
    key: 'MOVE',
    title: '이사권',
    description: '다른 섹션/번호로 이동하고 싶을 때 사용하세요.',
    priceLabel: '1,000 수박씨',
    itemId: STORE_ITEM_IDS.MOVE,
    icon: RiExchangeLine,
  },
  {
    key: 'PENALTY_REDUCE',
    title: '패널티 감면권',
    description: '패널티/연체 일수를 한 번 줄여줍니다.',
    priceLabel: '600 수박씨',
    itemId: STORE_ITEM_IDS.PENALTY_REDUCE,
    icon: RiShieldCheckLine,
  },
]
