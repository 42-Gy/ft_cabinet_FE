import type { LinkProvider } from '@/features/auth/types'
import type { UserProfile } from '@/types/user'

const recentLinkedProviderKey = 'subak_recent_social_linked_provider'

const getLinkedProviderKey = (userId: number, provider: LinkProvider) =>
  `subak_social_linked:${userId}:${provider}`

const providerFieldNames: Record<LinkProvider, string[]> = {
  kakao: [
    'kakaoLinked',
    'isKakaoLinked',
    'linkedKakao',
    'hasKakao',
    'hasKakaoAccount',
    'kakaoConnected',
    'kakaoLinkedAt',
  ],
  google: [
    'googleLinked',
    'isGoogleLinked',
    'linkedGoogle',
    'hasGoogle',
    'hasGoogleAccount',
    'googleConnected',
    'googleLinkedAt',
  ],
}

const providerListFieldNames = [
  'linkedProviders',
  'socialProviders',
  'oauthProviders',
  'linkedSocialProviders',
  'linkedOAuthProviders',
]

const providerMapFieldNames = [
  'linkedSocialAccounts',
  'socialAccounts',
  'oauthAccounts',
  'linkedProviders',
]

const isTruthyLinkedValue = (value: unknown) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  if (typeof value === 'string') return value.length > 0 && value.toLowerCase() !== 'false'
  return Boolean(value)
}

const hasProviderInList = (value: unknown, provider: LinkProvider) => {
  if (!Array.isArray(value)) return false
  return value.some((entry) => String(entry).toLowerCase() === provider)
}

const hasProviderInMap = (value: unknown, provider: LinkProvider) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return isTruthyLinkedValue(record[provider]) || isTruthyLinkedValue(record[provider.toUpperCase()])
}

const isStoredSocialProviderLinked = (userId: number, provider: LinkProvider) => {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(getLinkedProviderKey(userId, provider)) === 'true'
}

export const markSocialProviderLinked = (userId: number | undefined, provider: LinkProvider) => {
  if (typeof window === 'undefined' || !userId) return
  window.localStorage.setItem(getLinkedProviderKey(userId, provider), 'true')
}

export const markRecentSocialProviderLinked = (provider: LinkProvider) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(recentLinkedProviderKey, provider)
}

export const consumeRecentSocialProviderLinked = () => {
  if (typeof window === 'undefined') return null
  const value = window.localStorage.getItem(recentLinkedProviderKey)
  window.localStorage.removeItem(recentLinkedProviderKey)
  if (value === 'kakao' || value === 'google') return value
  return null
}

export const isSocialProviderLinked = (me: UserProfile, provider: LinkProvider) => {
  const profile = me as UserProfile & Record<string, unknown>

  if (isStoredSocialProviderLinked(me.userId, provider)) return true

  if (providerFieldNames[provider].some((fieldName) => isTruthyLinkedValue(profile[fieldName]))) {
    return true
  }

  if (providerListFieldNames.some((fieldName) => hasProviderInList(profile[fieldName], provider))) {
    return true
  }

  return providerMapFieldNames.some((fieldName) => hasProviderInMap(profile[fieldName], provider))
}
