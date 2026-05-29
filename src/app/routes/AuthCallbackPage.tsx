import { useEffect, useState } from 'react'
import { Button, Stack } from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ErrorState } from '@/components/molecules/ErrorState'
import { LoadingState } from '@/components/molecules/LoadingState'
import { fetchMe } from '@/features/users/api/me'
import { meQueryKeys } from '@/features/users/hooks/useMeQuery'

type CallbackStatus = 'checking' | 'failed'

export const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<CallbackStatus>('checking')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const confirmSession = async () => {
      const oauthError = searchParams.get('error')
      if (oauthError) {
        setErrorMessage(oauthError)
        setStatus('failed')
        return
      }

      const me = await fetchMe()
      if (!isMounted) return
      if (me) {
        queryClient.setQueryData(meQueryKeys.root, me)
        navigate('/', { replace: true })
        return
      }
      setStatus('failed')
    }

    confirmSession().catch(() => {
      if (!isMounted) return
      setStatus('failed')
    })

    return () => {
      isMounted = false
    }
  }, [navigate, queryClient, searchParams])

  if (status === 'checking') {
    return <LoadingState label="로그인 상태를 확인하는 중입니다." />
  }

  return (
    <Stack spacing={4} align="center" py={8} w="full">
      <ErrorState
        description={
          errorMessage ??
          '로그인 정보를 확인하지 못했습니다. 42 계정으로 최초 로그인 후 카카오/구글 계정을 연동해 주세요.'
        }
      />
      <Button
        colorScheme="brand"
        onClick={() => navigate('/login')}
      >
        로그인 선택으로 돌아가기
      </Button>
    </Stack>
  )
}
