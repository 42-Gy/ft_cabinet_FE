import { apiClient } from '@/libs/axios/client'
import { env } from '@/libs/env'
import { unwrapApiResponse } from '@/libs/axios/unwrap'
import type { LinkProvider, OAuthProvider } from '@/features/auth/types'
import { createOAuthState, saveOAuthLinkState } from '@/features/auth/utils/socialLinkState'

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

const getOAuthLinkClientId = (provider: LinkProvider) => {
  if (provider === 'kakao') return env.kakaoOAuthClientId
  return env.googleOAuthClientId
}

const createOAuthLinkUrl = (provider: LinkProvider, redirectUri: string, state: string) => {
  const clientId = getOAuthLinkClientId(provider)
  if (!clientId) {
    throw new Error(`${getOAuthProviderLabel(provider)} 연동용 OAuth Client ID가 설정되지 않았습니다.`)
  }

  if (provider === 'kakao') {
    const url = new URL('https://kauth.kakao.com/oauth/authorize')
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    }).toString()
    return url
  }

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
  }).toString()
  return url
}

export const startOAuthLink = (provider: LinkProvider) => {
  if (typeof window === 'undefined') return
  const redirectUri = `${window.location.origin}/auth/link/callback/${provider}`
  const state = createOAuthState()
  const url = createOAuthLinkUrl(provider, redirectUri, state)

  saveOAuthLinkState(provider, state)
  window.location.href = url.toString()
}

export const linkSocialAccount = async (provider: LinkProvider, authorizationCode: string) => {
  const { data } = await apiClient.post(`/v4/auth/link/${provider}`, {
    authorizationCode,
  })
  return unwrapApiResponse<string>(data)
}
