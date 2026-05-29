import { useToast } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  getOAuthProviderLabel,
  linkSocialAccount,
} from '@/features/auth/api/socialAuth'
import type { LinkProvider } from '@/features/auth/types'
import { meQueryKeys } from '@/features/users/hooks/useMeQuery'

const defaultErrorMessage = '소셜 계정 연동 중 문제가 발생했습니다.'

const parseLinkError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data?.error?.message) return data.error.message
    if (data?.message) return data.message
  }
  if (error instanceof Error) return error.message
  return defaultErrorMessage
}

export const useSocialLinkMutation = () => {
  const toast = useToast()
  const queryClient = useQueryClient()

  return useMutation<string, unknown, { provider: LinkProvider; authorizationCode: string }>({
    mutationFn: ({ provider, authorizationCode }) => linkSocialAccount(provider, authorizationCode),
    onSuccess: (message, variables) => {
      queryClient.invalidateQueries({ queryKey: meQueryKeys.root })
      toast({
        description: message || `${getOAuthProviderLabel(variables.provider)} 계정 연동이 완료되었습니다.`,
        status: 'success',
      })
    },
    onError: (error) => {
      toast({ description: parseLinkError(error), status: 'error' })
    },
  })
}
