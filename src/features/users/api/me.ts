import { apiClient } from '@/libs/axios/client'
import { unwrapApiResponse } from '@/libs/axios/unwrap'
import type { UserProfile } from '@/types/user'

type RawUserProfile = UserProfile & {
  pisciner?: unknown
  is_pisciner?: unknown
}

const toBooleanFlag = (value: unknown) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return false
}

const normalizeUserProfile = (profile: RawUserProfile): UserProfile => ({
  ...profile,
  isPisciner:
    toBooleanFlag(profile.isPisciner) ||
    toBooleanFlag(profile.pisciner) ||
    toBooleanFlag(profile.is_pisciner),
})

export const fetchMe = async (): Promise<UserProfile | null> => {
  try {
    const { data } = await apiClient.get('/v4/users/me', {
      headers: {
        'X-Skip-Reissue': 'true',
      },
    })
    return normalizeUserProfile(unwrapApiResponse<RawUserProfile>(data))
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
