import { useQuery } from '@tanstack/react-query'
import { fetchStoreItems } from '@/features/store/api/items'

export const storeQueryKeys = {
  items: ['store-items'] as const,
}

export const useStoreItemsQuery = (enabled = true) =>
  useQuery({
    queryKey: storeQueryKeys.items,
    queryFn: fetchStoreItems,
    enabled,
  })
