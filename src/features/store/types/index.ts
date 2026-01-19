export type StoreItemType = 'LENT' | 'EXTENSION' | 'SWAP' | 'PENALTY_EXEMPTION'

export interface StoreItemResponse {
  itemId: number
  name: string
  type: StoreItemType
  price: number
  description?: string
}
