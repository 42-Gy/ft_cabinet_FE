import type { LinkProvider } from '@/features/auth/types'

const socialLinkStateKey = 'subak_social_link_state'

export const createOAuthState = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const saveOAuthLinkState = (provider: LinkProvider, state: string) => {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(
    socialLinkStateKey,
    JSON.stringify({
      provider,
      state,
    }),
  )
}

export const consumeOAuthLinkState = (provider: LinkProvider, state: string | null) => {
  if (typeof window === 'undefined' || !state) return false

  const stored = window.sessionStorage.getItem(socialLinkStateKey)
  window.sessionStorage.removeItem(socialLinkStateKey)
  if (!stored) return false

  let parsed: Partial<{ provider: LinkProvider; state: string }>
  try {
    parsed = JSON.parse(stored) as Partial<{ provider: LinkProvider; state: string }>
  } catch {
    return false
  }
  return parsed.provider === provider && parsed.state === state
}
