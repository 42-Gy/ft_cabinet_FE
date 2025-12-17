import { useAuthTokenContext } from '@/features/auth/providers/AuthTokenProvider'

export const useAuthToken = () => useAuthTokenContext()
