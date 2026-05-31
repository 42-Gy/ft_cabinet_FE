import { useQueryClient } from '@tanstack/react-query'
import { tokenStore } from '@/libs/auth/tokenStore'
import { apiClient } from '@/libs/axios/client'
import { meQueryKeys, useMeQuery } from '@/features/users/hooks/useMeQuery'

export const useAuthSession = () => {
  const queryClient = useQueryClient()
  const { data: me, isLoading } = useMeQuery()
  const isAuthenticated = Boolean(me)

  const logout = async () => {
    try {
      await apiClient.post(
        '/v4/auth/logout',
        {},
        {
          withCredentials: true,
          validateStatus: (status) => status === 200 || status === 302,
        },
      )
    } catch {
      // ignore logout failures
    } finally {
      tokenStore.clear()
      queryClient.setQueryData(meQueryKeys.root, null)
      queryClient.invalidateQueries({ queryKey: meQueryKeys.root })
      if (typeof window !== 'undefined') {
        window.location.assign('/')
      }
    }
  }

  return { me, isAuthenticated, isLoading, logout }
}
