import { Box, Button, Icon, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { EmptyState } from '@/components/molecules/EmptyState'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'
import { useBuyItemMutation } from '@/features/lockers/hooks/useLockerData'
import { STORE_ITEM_META_BY_TYPE } from '@/features/store/data/items'
import { useStoreItemsQuery } from '@/features/store/hooks/useStoreItems'
import type { StoreItemResponse } from '@/features/store/types'

export const StorePage = () => {
  const { data: me, isLoading, isError, refetch } = useMeQuery()
  const itemsQuery = useStoreItemsQuery(Boolean(me))
  const buyMutation = useBuyItemMutation()
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')

  if (isError) {
    return <ErrorState onRetry={refetch} />
  }

  if (!me) {
    return (
      <EmptyState
        title="로그인이 필요해요"
        description="우측 상단의 로그인 버튼을 눌러 로그인한 뒤 이용해 주세요."
      />
    )
  }

  if (isLoading || itemsQuery.isLoading) {
    return <LoadingState label="스토어 정보를 불러오는 중입니다." />
  }
  if (itemsQuery.isError) {
    return <ErrorState onRetry={itemsQuery.refetch} />
  }

  const storeItems = itemsQuery.data ?? []
  if (storeItems.length === 0) {
    return <EmptyState title="표시할 아이템이 없습니다" description="잠시 후 다시 시도해 주세요." />
  }

  const toDisplayItem = (item: StoreItemResponse) => {
    const meta = STORE_ITEM_META_BY_TYPE[item.type]
    const title = meta?.title ?? item.name
    const description = item.description || `${title} 아이템입니다.`
    const priceLabel = `${Number(item.price ?? 0).toLocaleString()} 수박씨`
    return {
      id: item.itemId,
      title,
      description,
      priceLabel,
      icon: meta?.icon,
      disabled: meta?.disabled,
    }
  }

  return (
    <Stack spacing={8}>
      <PageHeader
        title="스토어"
        description="연장권/이사권/패널티 감면권을 수박씨로 즉시 구매할 수 있어요."
      />
      <Box borderWidth={1} borderRadius="xl" bg={cardBg} p={6} borderColor={borderColor} shadow="sm">
        <Text fontWeight="bold">보유 수박씨</Text>
        <Text fontSize="2xl" fontWeight="black">
          {typeof me?.coin === 'number' ? me.coin.toLocaleString() : '-'} 개
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {storeItems.map((rawItem) => {
          const item = toDisplayItem(rawItem)
          const isDisabled = Boolean(item.disabled)
          const isLoading = pendingItemId === item.id && buyMutation.isPending
          return (
            <Box
              key={item.id}
              borderWidth={1}
              borderColor={borderColor}
              borderRadius="xl"
              p={6}
              bg={cardBg}
              shadow="sm"
            >
              <Stack spacing={3}>
                {item.icon && (
                  <Icon
                    as={item.icon}
                    boxSize={12}
                    color={isDisabled ? 'gray.400' : 'brand.500'}
                  />
                )}
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
                    setPendingItemId(item.id)
                    buyMutation.mutate(item.id, {
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
