import type { IconType } from 'react-icons'
import {
  RiExchangeLine,
  RiShieldCheckLine,
  RiTicket2Line,
  RiTimerLine,
} from 'react-icons/ri'
import type { StoreItemType } from '@/features/store/types'

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
    description: '사물함을 31일간 대여할 수 있습니다.',
    priceLabel: '0 수박씨',
    itemId: STORE_ITEM_IDS.RENT,
    icon: RiTicket2Line,
    disabled: true,
  },
  {
    key: 'EXTEND',
    title: '연장권',
    description: '대여 기간을 3일 연장합니다. (최대 보유 5개/월 구매 5회)',
    priceLabel: '400 수박씨',
    itemId: STORE_ITEM_IDS.EXTEND,
    icon: RiTimerLine,
  },
  {
    key: 'MOVE',
    title: '이사권',
    description: '현재 반납일 그대로 다른 사물함으로 이동합니다.',
    priceLabel: '1,000 수박씨',
    itemId: STORE_ITEM_IDS.MOVE,
    icon: RiExchangeLine,
  },
  {
    key: 'PENALTY_REDUCE',
    title: '패널티 감면권',
    description: '패널티 기간을 1일 줄여줍니다.',
    priceLabel: '600 수박씨',
    itemId: STORE_ITEM_IDS.PENALTY_REDUCE,
    icon: RiShieldCheckLine,
  },
]

export const STORE_ITEM_META_BY_TYPE: Record<StoreItemType, { title: string; icon: IconType; disabled?: boolean }> = {
  LENT: {
    title: '대여권',
    icon: RiTicket2Line,
    disabled: true,
  },
  EXTENSION: {
    title: '연장권',
    icon: RiTimerLine,
  },
  SWAP: {
    title: '이사권',
    icon: RiExchangeLine,
  },
  PENALTY_EXEMPTION: {
    title: '패널티 감면권',
    icon: RiShieldCheckLine,
  },
}

export const STORE_ITEM_DESCRIPTION_BY_TYPE: Record<StoreItemType, string> = {
  LENT: '사물함을 31일간 대여할 수 있습니다.',
  EXTENSION: '대여 기간을 3일 연장합니다. (최대 보유 5개/월 구매 5회)',
  SWAP: '현재 반납일 그대로 다른 사물함으로 이동합니다.',
  PENALTY_EXEMPTION: '패널티 기간을 1일 줄여줍니다.',
}
