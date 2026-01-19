import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '@/features/users/api/me'

export const meQueryKeys = {
  root: ['me'] as const,
}

export const useMeQuery = (enabled = true) => {
  return useQuery({
    queryKey: meQueryKeys.root,
    queryFn: fetchMe,
    enabled,
    staleTime: 1000 * 60,
    retry: false,
  })
}
