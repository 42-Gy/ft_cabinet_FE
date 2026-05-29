import { apiClient } from '@/libs/axios/client'
import { unwrapApiResponse } from '@/libs/axios/unwrap'

export type OAuthProvider = '42' | 'kakao' | 'google'
export type LinkProvider = 'kakao' | 'google'

const oauthProviderLabels: Record<OAuthProvider, string> = {
  '42': '42',
  kakao: '카카오',
  google: '구글',
}

export const getOAuthProviderLabel = (provider: OAuthProvider | LinkProvider) =>
  oauthProviderLabels[provider]

export const startOAuthLogin = (provider: OAuthProvider) => {
  if (typeof window === 'undefined') return
  window.location.href = `/oauth2/authorization/${provider}`
}

export const startOAuthLink = (provider: LinkProvider) => {
  if (typeof window === 'undefined') return
  const redirectUri = `${window.location.origin}/auth/link/callback/${provider}`
  const params = new URLSearchParams({
    mode: 'link',
    redirect_uri: redirectUri,
  })
  window.location.href = `/oauth2/authorization/${provider}?${params.toString()}`
}

export const linkSocialAccount = async (provider: LinkProvider, authorizationCode: string) => {
  const { data } = await apiClient.post(`/v4/auth/link/${provider}`, {
    authorizationCode,
  })
  return unwrapApiResponse<string>(data)
}

