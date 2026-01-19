import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/libs/axios/client'
import { meQueryKeys, useMeQuery } from '@/features/users/hooks/useMeQuery'

export const useAuthSession = () => {
  const queryClient = useQueryClient()
  const { data: me, isLoading } = useMeQuery()
  const isAuthenticated = Boolean(me)

  const logout = async () => {
    try {
      await apiClient.post('/v4/auth/logout', {})
    } catch {
      // ignore logout failures
    } finally {
      queryClient.setQueryData(meQueryKeys.root, null)
      queryClient.invalidateQueries({ queryKey: meQueryKeys.root })
      if (typeof window !== 'undefined') {
        window.location.assign('/')
      }
    }
  }

  return { me, isAuthenticated, isLoading, logout }
}
