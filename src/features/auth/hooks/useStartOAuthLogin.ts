import { startOAuthLogin } from '@/features/auth/api/socialAuth'
import type { OAuthProvider } from '@/features/auth/types'

export const useStartOAuthLogin = () => (provider: OAuthProvider) => {
  startOAuthLogin(provider)
}
