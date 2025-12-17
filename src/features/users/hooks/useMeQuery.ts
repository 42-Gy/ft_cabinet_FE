import { useQuery } from '@tanstack/react-query'
import { fetchMe } from '@/features/users/api/me'
import { useAuthToken } from '@/features/auth/hooks/useAuthToken'

export const meQueryKeys = {
  root: ['me'] as const,
}

export const useMeQuery = (enabled = true) => {
  const { token } = useAuthToken()

  return useQuery({
    queryKey: meQueryKeys.root,
    queryFn: fetchMe,
    enabled: Boolean(token && enabled),
    staleTime: 1000 * 60,
    retry: false,
  })
}
