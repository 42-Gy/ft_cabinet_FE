import { useEffect, useRef, useState } from 'react'
import { Button, Stack } from '@chakra-ui/react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ErrorState } from '@/components/molecules/ErrorState'
import { LoadingState } from '@/components/molecules/LoadingState'
import { useSocialLinkMutation } from '@/features/auth/hooks/useSocialLink'
import type { LinkProvider } from '@/features/auth/api/socialAuth'

const isLinkProvider = (value: string | undefined): value is LinkProvider =>
  value === 'kakao' || value === 'google'

export const SocialLinkCallbackPage = () => {
  const navigate = useNavigate()
  const { provider } = useParams()
  const [searchParams] = useSearchParams()
  const linkMutation = useSocialLinkMutation()
  const requestedRef = useRef(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (requestedRef.current) return
    requestedRef.current = true

    const error = searchParams.get('error')
    if (error) {
      setErrorMessage(error)
      return
    }

    const authorizationCode = searchParams.get('code')
    if (!isLinkProvider(provider) || !authorizationCode) {
      setErrorMessage('소셜 계정 연동 정보를 확인하지 못했습니다.')
      return
    }

    linkMutation.mutate(
      { provider, authorizationCode },
      {
        onSuccess: () => navigate('/my/lockers', { replace: true }),
        onError: () => setErrorMessage('소셜 계정 연동에 실패했습니다. 다시 시도해 주세요.'),
      },
    )
  }, [linkMutation, navigate, provider, searchParams])

  if (!errorMessage) {
    return <LoadingState label="소셜 계정 연동을 완료하는 중입니다." />
  }

  return (
    <Stack spacing={4} align="center" py={8} w="full">
      <ErrorState description={errorMessage} />
      <Button colorScheme="brand" onClick={() => navigate('/my/lockers')}>
        내 사물함으로 돌아가기
      </Button>
    </Stack>
  )
}
