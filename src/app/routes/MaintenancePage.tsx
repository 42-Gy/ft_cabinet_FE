import { keyframes } from '@emotion/react'
import { Box, Button, Flex, Heading, HStack, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'

export const MaintenancePage = () => {
  const { isAuthenticated, logout, me, isLoading } = useAuthSession()
  const isAdmin = me?.role === 'ADMIN' || me?.role === 'ROLE_ADMIN' || me?.role === 'MASTER'

  const riseIn = keyframes`
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  `

  const bg = useColorModeValue('#fff6f4', '#111517')
  const cardBg = useColorModeValue('white', 'gray.900')
  const cardBorder = useColorModeValue('brand.100', 'whiteAlpha.200')
  const mutedText = useColorModeValue('gray.600', 'gray.300')
  const accentText = useColorModeValue('brand.600', 'brand.200')
  const shadow = useColorModeValue('0 20px 60px rgba(255, 90, 109, 0.18)', '0 20px 60px rgba(0,0,0,0.45)')

  const handleLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/oauth2/authorization/42'
    }
  }

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={bg}
      px={{ base: 6, md: 10 }}
      py={{ base: 12, md: 16 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        sx={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, rgba(255, 196, 198, 0.45), transparent 45%),' +
            'radial-gradient(circle at 88% 22%, rgba(114, 223, 171, 0.35), transparent 45%),' +
            'linear-gradient(120deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0))',
        }}
      />
      <Box
        position="absolute"
        top={{ base: 8, md: 10 }}
        right={{ base: 6, md: 12 }}
        px={4}
        py={2}
        borderRadius="full"
        borderWidth={1}
        borderColor={cardBorder}
        bg={cardBg}
        boxShadow={shadow}
        fontSize="xs"
        fontWeight="bold"
        color={accentText}
      >
        정식운영전 서비스 점검
      </Box>
      <Box
        position="relative"
        w="full"
        maxW="760px"
        bg={cardBg}
        borderRadius="28px"
        borderWidth={1}
        borderColor={cardBorder}
        boxShadow={shadow}
        px={{ base: 6, md: 12 }}
        py={{ base: 8, md: 12 }}
        animation={`${riseIn} 0.6s ease-out`}
      >
        <Stack spacing={8}>
          <Stack spacing={4}>
            <Text fontSize="sm" letterSpacing="0.24em" textTransform="uppercase" color={accentText}>
              Subak Service Status
            </Text>
            <Heading fontSize={{ base: '3xl', md: '4xl' }} lineHeight={1.1}>
              지금은 잠시 점검 중입니다.
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color={mutedText}>
              정식 운영 전 안정화 작업을 진행하고 있습니다. 서비스 품질을 높이기 위한 준비 시간이니,
              잠시 후 다시 방문해 주세요.
            </Text>
          </Stack>

          <Box
            borderRadius="20px"
            borderWidth={1}
            borderColor={useColorModeValue('brand.100', 'whiteAlpha.200')}
            bg={useColorModeValue('brand.50', 'whiteAlpha.100')}
            px={{ base: 5, md: 6 }}
            py={{ base: 5, md: 6 }}
          >
            <Stack spacing={3}>
              <Text fontWeight="bold" fontSize="lg">
                관리자 확인용 로그인
              </Text>
              <Text fontSize="sm" color={mutedText}>
                운영 점검 상태에서도 관리자 계정만 정상 페이지를 확인할 수 있습니다.
              </Text>
              <HStack spacing={3} flexWrap="wrap">
                <Button
                  colorScheme="brand"
                  onClick={isAuthenticated ? logout : handleLogin}
                  isLoading={isLoading}
                >
                  {isAuthenticated ? '다른 계정으로 로그인' : '관리자 로그인'}
                </Button>
                {isAuthenticated && !isAdmin && (
                  <Text fontSize="sm" color={mutedText}>
                    현재 계정은 관리자 권한이 없습니다.
                  </Text>
                )}
              </HStack>
            </Stack>
          </Box>

          <Box>
            <Text fontSize="sm" color={mutedText}>
              문의: 내부 운영 채널 또는 담당자에게 연락해 주세요.
            </Text>
          </Box>
        </Stack>
      </Box>
    </Flex>
  )
}
