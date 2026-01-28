import { Badge, Box, Button, Image, Stack, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { useCabinetSummaryAllQuery } from '@/features/lockers/hooks/useLockerData'
import { HomeOverview } from '@/features/status/components/HomeOverview'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'

export const HomePage = () => {
  const { data: me } = useMeQuery()
  const isLoggedIn = Boolean(me)
  const summaryQuery = useCabinetSummaryAllQuery()
  const isLoading = summaryQuery.isLoading
  const contentWidth = 'min(1200px, calc(100% - 64px))'
  const heroBg = useColorModeValue(
    "url('/assets/images/bg_full.png')",
    "url('/assets/images/dark_bg.png')",
  )
  const heroCardBg = useColorModeValue(
    "url('/assets/images/hero_bg2.png')",
    "url('/assets/images/dark_hero.png')",
  )
  const badgeBg = useColorModeValue('whiteAlpha.800', 'blackAlpha.600')
  const badgeColor = useColorModeValue('pink.600', 'blue.200')
  const titleColor = useColorModeValue('whiteAlpha.900', 'whiteAlpha.900')
  const subtitleColor = useColorModeValue('gray.600', 'gray.200')
  const buttonBg = useColorModeValue('brand.500', 'blue.600')
  const buttonHover = useColorModeValue('brand.400', 'blue.500')
  const buttonActive = useColorModeValue('brand.600', 'blue.700')
  const titleStroke = useColorModeValue(
    '0.01px rgba(255, 120, 160, 0.55)',
    '0.01px rgba(80, 120, 200, 0.6)',
  )
  const titleShadow = useColorModeValue(
    '0 8px 18px rgba(255, 105, 135, 0.35)',
    '0 8px 18px rgba(30, 60, 110, 0.45)',
  )

  return (
    <Box minH="100vh" pb={{ base: 10, md: 12 }}>
      <VStack spacing={{ base: 8, md: 10 }} w="full" align="stretch">
        <Box
          w="100vw"
          position="relative"
          left="50%"
          right="50%"
          ml="-50vw"
          mr="-50vw"
          mt={{ base: -5, md: -7 }}
          bgImage={heroBg}
          bgRepeat="no-repeat"
          bgSize="cover"
          bgPos="center"
          pt={{ base: 6, md: 10 }}
          pb={{ base: 10, md: 12 }}
        >
          <Box
            w={contentWidth}
            mx="auto"
            h={{ base: 'auto', md: '380px' }}
            borderRadius="28px"
            bgImage={heroCardBg}
            bgSize="cover"
            bgPos="center"
            bgRepeat="no-repeat"
            p={{ base: '28px 24px', md: '56px 64px' }}
            shadow="0 20px 60px rgba(0,0,0,0.12)"
            overflow="hidden"
          >
            <Stack spacing={4} maxW={{ base: '100%', md: '720px' }}>
              <Badge
                w="fit-content"
                px={3}
                py={1}
                fontSize="sm"
                borderRadius="12px"
                bg={badgeBg}
                color={badgeColor}
              >
                SUBAK STORIES
              </Badge>
              <Text
                fontSize={{ base: '36px', md: '56px' }}
                fontWeight="black"
                lineHeight={1.15}
                letterSpacing="-0.02em"
                maxW="720px"
                wordBreak="keep-all"
                whiteSpace="normal"
                color={titleColor}
                textShadow={titleShadow}
                sx={{ WebkitTextStroke: titleStroke }}
              >
                무거운 짐, 캠퍼스에 두고 가세요.
              </Text>
              <Text
                mt="16px"
                fontSize={{ base: '16px', md: '18px' }}
                lineHeight={1.6}
                maxW="640px"
                color={subtitleColor}
              >
                42 경산 학습자를 위한 공유 사물함 대여 서비스
              </Text>
              <Button
                mt="28px"
                height="52px"
                px="18px"
                borderRadius="16px"
                alignSelf="flex-start"
                bg={buttonBg}
                color="white"
                _hover={{ bg: buttonHover }}
                _active={{ bg: buttonActive }}
                display="inline-flex"
                alignItems="center"
                gap="10px"
                as="a"
                href="/lockers"
                w={{ base: '100%', md: 'auto' }}
                justifyContent={{ base: 'center', md: 'flex-start' }}
              >
                지금 비어있는 사물함 확인
                <Image src="/assets/images/icon_box.png" alt="상자 아이콘" boxSize="22px" />
              </Button>
            </Stack>
          </Box>

          {isLoading && (
            <Stack spacing={3} align="center" mt={8} bg="transparent">
              <Text fontSize="sm" color="gray.600">
                로딩중
              </Text>
            </Stack>
          )}
        </Box>

        {!isLoading && (
          <Box w="100vw" position="relative" left="50%" right="50%" ml="-50vw" mr="-50vw">
            <Box w={contentWidth} mx="auto">
              <HomeOverview
                summaryAll={summaryQuery.data}
                summaryError={summaryQuery.isError}
                summaryLoading={summaryQuery.isLoading}
                onRetry={summaryQuery.refetch}
                isLoggedIn={isLoggedIn}
              />
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
