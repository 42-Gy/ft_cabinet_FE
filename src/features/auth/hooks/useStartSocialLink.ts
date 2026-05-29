import { useToast } from '@chakra-ui/react'
import { startOAuthLink } from '@/features/auth/api/socialAuth'
import type { LinkProvider } from '@/features/auth/types'

export const useStartSocialLink = () => {
  const toast = useToast()

  return (provider: LinkProvider) => {
    try {
      startOAuthLink(provider)
    } catch (error) {
      toast({
        description:
          error instanceof Error ? error.message : '소셜 계정 연동을 시작하지 못했습니다.',
        status: 'error',
      })
    }
  }
}
