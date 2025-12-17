import { apiClient } from '@/libs/axios/client'
import { tokenStore } from '@/libs/auth/tokenStore'
import type { UserProfile } from '@/types/user'

export const fetchMe = async (): Promise<UserProfile> => {
  const token = tokenStore.get()
  if (!token) {
    throw new Error('액세스 토큰이 없습니다. 다시 로그인해 주세요.')
  }

  const { data } = await apiClient.get<UserProfile>('/v4/users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return data
}
