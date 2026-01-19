import { useEffect, useState } from 'react'
import { Button, Stack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { fetchMe } from '@/features/users/api/me'
import { env } from '@/libs/env'

type CallbackStatus = 'checking' | 'failed'

export const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState<CallbackStatus>('checking')

  useEffect(() => {
    let isMounted = true

    const confirmSession = async () => {
      const me = await fetchMe()
      if (!isMounted) return
      if (me) {
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
  }, [navigate])

  if (status === 'checking') {
    return <LoadingState label="로그인 상태를 확인하는 중입니다." />
  }

  return (
    <Stack spacing={4} align="center" py={8} w="full">
      <ErrorState description="로그인 정보를 확인하지 못했습니다. 다시 로그인해 주세요." />
      <Button
        colorScheme="brand"
        onClick={() => (window.location.href = `${env.authBaseUrl}/oauth2/authorization/42`)}
      >
        다시 로그인하기
      </Button>
    </Stack>
  )
}
