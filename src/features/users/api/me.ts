import { apiClient } from '@/libs/axios/client'
import { unwrapApiResponse } from '@/libs/axios/unwrap'
import type { UserProfile } from '@/types/user'

export const fetchMe = async (): Promise<UserProfile | null> => {
  try {
    const { data } = await apiClient.get('/v4/users/me', {
      headers: {
        'X-Skip-Reissue': 'true',
      },
    })
    return unwrapApiResponse<UserProfile>(data)
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { status?: number } }).response
      if (response?.status === 401) {
        return null
      }
    }
    throw error
  }
}
