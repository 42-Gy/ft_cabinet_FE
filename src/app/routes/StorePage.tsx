import { Box, Button, Icon, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { EmptyState } from '@/components/molecules/EmptyState'
import { LoadingState } from '@/components/molecules/LoadingState'
import { useAuthToken } from '@/features/auth/hooks/useAuthToken'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'
import { useBuyItemMutation } from '@/features/lockers/hooks/useLockerData'
import { STORE_ITEMS } from '@/features/store/data/items'

export const StorePage = () => {
  const { token } = useAuthToken()
  const { data: me, isLoading } = useMeQuery()
  const buyMutation = useBuyItemMutation()
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')

  if (!token) {
    return (
      <EmptyState title="로그인이 필요합니다" description="헤더의 로그인 버튼을 눌러 42 OAuth로 이동해 주세요." />
    )
  }

  if (isLoading) return <LoadingState label="스토어 정보를 불러오는 중입니다." />

  return (
    <Stack spacing={8}>
      <PageHeader
        title="스토어"
        description="연장권/이사권/패널티 감면권을 수박씨로 즉시 구매할 수 있어요."
      />
      <Box borderWidth={1} borderRadius="xl" bg={cardBg} p={6} borderColor={borderColor} shadow="sm">
        <Text fontWeight="bold">보유 코인</Text>
        <Text fontSize="2xl" fontWeight="black">
          {me?.coin.toLocaleString() ?? '-'} 개
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {STORE_ITEMS.map((item) => {
          const isDisabled = Boolean(item.disabled)
          const isLoading = pendingItemId === item.itemId && buyMutation.isPending
          return (
            <Box
              key={item.key}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="xl"
            p={6}
            bg={cardBg}
            shadow="sm"
            >
              <Stack spacing={3}>
                <Icon
                  as={item.icon}
                  boxSize={12}
                  color={isDisabled ? 'gray.400' : 'brand.500'}
                />
                <Text fontSize="xl" fontWeight="bold">
                  {item.title}
                </Text>
                <Text fontSize="sm" color={textMuted}>
                  {item.description}
                </Text>
                <Text fontWeight="semibold">{item.priceLabel}</Text>
                <Button
                  colorScheme={isDisabled ? 'gray' : 'brand'}
                  variant={isDisabled ? 'outline' : 'solid'}
                  onClick={() => {
                    if (isDisabled) return
                    setPendingItemId(item.itemId)
                    buyMutation.mutate(item.itemId, {
                      onSettled: () => setPendingItemId(null),
                    })
                  }}
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                >
                  {isDisabled ? '구매 불가' : '구매하기'}
                </Button>
              </Stack>
            </Box>
          )
        })}
      </SimpleGrid>
    </Stack>
  )
}
