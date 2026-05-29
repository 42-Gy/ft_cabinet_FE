import {
  Box,
  Button,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Navigate } from 'react-router-dom'
import { Si42, SiGoogle, SiKakao } from 'react-icons/si'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'
import { useStartOAuthLogin } from '@/features/auth/hooks/useStartOAuthLogin'
import type { OAuthProvider } from '@/features/auth/types'

const loginOptions: Array<{
  provider: OAuthProvider
  title: string
  description: string
  icon: typeof Si42
  colorScheme: string
}> = [
  {
    provider: '42',
    title: '42로 로그인',
    description: '최초 로그인 및 기존 42 계정 로그인',
    icon: Si42,
    colorScheme: 'brand',
  },
  {
    provider: 'kakao',
    title: '카카오로 로그인',
    description: '마이페이지에서 연동한 계정으로 로그인',
    icon: SiKakao,
    colorScheme: 'yellow',
  },
  {
    provider: 'google',
    title: '구글로 로그인',
    description: '마이페이지에서 연동한 계정으로 로그인',
    icon: SiGoogle,
    colorScheme: 'blue',
  },
]

export const LoginPage = () => {
  const { isAuthenticated } = useAuthSession()
  const startOAuthLogin = useStartOAuthLogin()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <Stack spacing={8} maxW="840px" mx="auto">
      <Stack spacing={4} align="center" textAlign="center">
        <Image
          src="/assets/images/subak_log.png"
          alt="SUBAK 로고"
          boxSize={{ base: 16, md: 20 }}
          borderRadius="full"
        />
        <Stack spacing={2}>
          <Heading size="lg">로그인 방식을 선택해 주세요</Heading>
          <Text color={textMuted}>
            42 계정으로 최초 로그인 후 카카오/구글 계정을 연동하면 이후 소셜 로그인으로 이용할 수 있습니다.
          </Text>
        </Stack>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {loginOptions.map((option) => (
          <Box
            key={option.provider}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="xl"
            bg={cardBg}
            p={5}
            shadow="sm"
          >
            <Stack spacing={4} h="full">
              <Box as={option.icon} fontSize="32px" color={`${option.colorScheme}.500`} />
              <Stack spacing={1} flex={1}>
                <Text fontWeight="bold">{option.title}</Text>
                <Text fontSize="sm" color={textMuted}>
                  {option.description}
                </Text>
              </Stack>
              <Button colorScheme={option.colorScheme} onClick={() => startOAuthLogin(option.provider)}>
                선택하기
              </Button>
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
