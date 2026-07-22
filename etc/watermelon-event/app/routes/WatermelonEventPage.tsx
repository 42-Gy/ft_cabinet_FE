import { keyframes } from '@emotion/react'
import { useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  HStack,
  Image,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { LoadingState } from '@/components/molecules/LoadingState'
import {
  useBuyWatermelonEventItemMutation,
  useEnhanceWatermelonMutation,
  useWatermelonEventConfigQuery,
  useWatermelonEventLogsQuery,
  useWatermelonEventMeQuery,
  useWatermelonEventRankingsQuery,
} from '@/features/watermelon-event/hooks/useWatermelonEvent'
import type {
  EnhanceAnimationState,
  EnhanceOutcome,
  EnhanceResult,
  EventShopItem,
  WatermelonEventConfig,
  WatermelonEventMe,
} from '@/features/watermelon-event/types'
import { formatDate } from '@/utils/date'

const shopItems: Array<{
  key: EventShopItem
  title: string
  description: string
  icon: string
}> = [
  {
    key: 'DROP_PROTECTION',
    title: '하락 방지권',
    description: '하락 무효',
    icon: '🍀',
  },
  {
    key: 'DESTROY_PROTECTION',
    title: '파괴 방지권',
    description: '파괴 대신 -2강',
    icon: '🛡️',
  },
  {
    key: 'PREMIUM_FERTILIZER',
    title: '프리미엄 비료',
    description: '성공 확률 +5% (비료는 한 개만 사용 가능)',
    icon: '🌈',
  },
  {
    key: 'DANGEROUS_FERTILIZER',
    title: '위험한 비료',
    description: '성공 +10%, 파괴 +10% (7강 이후 사용 불가)',
    icon: '💀',
  },
]

const itemCountKeys: Record<EventShopItem, keyof WatermelonEventMe> = {
  DROP_PROTECTION: 'dropProtectionCount',
  DESTROY_PROTECTION: 'destroyProtectionCount',
  PREMIUM_FERTILIZER: 'premiumFertilizerCount',
  DANGEROUS_FERTILIZER: 'dangerousFertilizerCount',
}

const fertilizerItems: EventShopItem[] = ['PREMIUM_FERTILIZER', 'DANGEROUS_FERTILIZER']

const outcomeLabels: Record<EnhanceOutcome, string> = {
  SUCCESS: '성공',
  MAINTAIN: '유지',
  DROP: '하락',
  DESTROY: '파괴',
}

const outcomeSchemes: Record<EnhanceOutcome, string> = {
  SUCCESS: 'green',
  MAINTAIN: 'blue',
  DROP: 'orange',
  DESTROY: 'red',
}

const enhancePulse = keyframes`
  0%, 100% { transform: translateX(0) scale(1); filter: drop-shadow(0 0 0 rgba(255, 90, 109, 0)); }
  25% { transform: translateX(-8px) scale(1.03); filter: drop-shadow(0 0 18px rgba(255, 90, 109, 0.65)); }
  50% { transform: translateX(8px) scale(1.05); filter: drop-shadow(0 0 24px rgba(114, 223, 171, 0.7)); }
  75% { transform: translateX(-4px) scale(1.03); filter: drop-shadow(0 0 18px rgba(255, 196, 198, 0.8)); }
`

const resultPop = keyframes`
  0% { transform: scale(0.96); opacity: 0.72; }
  45% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`

const formatRate = (value?: number) => {
  if (typeof value !== 'number') return '0%'
  const percent = value <= 1 ? value * 100 : value
  return `${Math.round(percent * 10) / 10}%`
}

const getCurrentCost = (config: WatermelonEventConfig | undefined, level: number) =>
  config?.enhanceCosts[level] ?? 0

const getOutcomeMessage = (result: EnhanceResult) => {
  const protectedText = result.rawOutcome !== result.finalOutcome ? ' 방지권이 발동했습니다.' : ''
  if (result.finalOutcome === 'SUCCESS') {
    return `강화 성공! ${result.beforeLevel}강 → ${result.afterLevel}강${protectedText}`
  }
  if (result.finalOutcome === 'MAINTAIN') {
    return `강화 실패... 단계가 유지되었습니다.${protectedText}`
  }
  if (result.finalOutcome === 'DROP') {
    return `강화 실패... ${result.beforeLevel}강 → ${result.afterLevel}강으로 하락했습니다.${protectedText}`
  }
  return `수박씨앗이 파괴되었습니다...${protectedText}`
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export const WatermelonEventPage = () => {
  const meQuery = useWatermelonEventMeQuery()
  const configQuery = useWatermelonEventConfigQuery()
  const rankingsQuery = useWatermelonEventRankingsQuery(0, 10)
  const logsQuery = useWatermelonEventLogsQuery()
  const enhanceMutation = useEnhanceWatermelonMutation()
  const buyMutation = useBuyWatermelonEventItemMutation()
  const toast = useToast()

  const [selectedItems, setSelectedItems] = useState<Record<EventShopItem, boolean>>({
    DROP_PROTECTION: false,
    DESTROY_PROTECTION: false,
    PREMIUM_FERTILIZER: false,
    DANGEROUS_FERTILIZER: false,
  })
  const [quantities, setQuantities] = useState<Record<EventShopItem, number>>({
    DROP_PROTECTION: 1,
    DESTROY_PROTECTION: 1,
    PREMIUM_FERTILIZER: 1,
    DANGEROUS_FERTILIZER: 1,
  })
  const [animationState, setAnimationState] = useState<EnhanceAnimationState>('IDLE')
  const [lastResult, setLastResult] = useState<EnhanceResult | null>(null)

  const pageBg = useColorModeValue('#fff7fa', 'gray.900')
  const panelBg = useColorModeValue('white', 'gray.800')
  const softPanelBg = useColorModeValue('brand.50', 'whiteAlpha.100')
  const borderColor = useColorModeValue('brand.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')

  if (meQuery.isLoading || configQuery.isLoading) {
    return <LoadingState label="수박씨 강화 이벤트를 불러오는 중입니다." />
  }

  if (meQuery.isError || configQuery.isError) {
    return (
      <ErrorState
        onRetry={() => {
          meQuery.refetch()
          configQuery.refetch()
        }}
      />
    )
  }

  if (!meQuery.data || !configQuery.data) {
    return <EmptyState title="이벤트 정보가 없습니다" description="잠시 후 다시 시도해 주세요." />
  }

  const me = meQuery.data
  const config = configQuery.data
  const maxLevel = config.maxLevel ?? 10
  const isMaxLevel = me.currentLevel >= maxLevel
  const enhanceCost = getCurrentCost(config, me.currentLevel)
  const totalCost = enhanceCost
  const getItemCount = (item: EventShopItem) => Number(me[itemCountKeys[item]] ?? 0)
  const selectedItemCount = shopItems.filter((item) => selectedItems[item.key]).length
  const selectedFertilizerCount = fertilizerItems.filter((item) => selectedItems[item]).length
  const selectedItemsUsable = shopItems.every((item) => {
    if (!selectedItems[item.key]) return true
    if (getItemCount(item.key) <= 0) return false
    if (fertilizerItems.includes(item.key) && me.currentLevel >= 7) return false
    return true
  }) && selectedItemCount <= 2 && selectedFertilizerCount <= 1

  const probabilities = {
    success: config.successRates[me.currentLevel],
    maintain: config.maintainRates[me.currentLevel],
    drop: config.dropRates[me.currentLevel],
    destroy: config.destroyRates[me.currentLevel],
  }

  const canEnhance =
    !isMaxLevel &&
    !enhanceMutation.isPending &&
    animationState !== 'ENHANCING' &&
    selectedItemsUsable &&
    me.seedBalance >= totalCost

  const isItemDisabled = (item: EventShopItem) => {
    if (selectedItems[item]) return false
    if (getItemCount(item) <= 0) return true
    if (selectedItemCount >= 2) return true
    if (fertilizerItems.includes(item) && me.currentLevel >= 7) return true
    if (fertilizerItems.includes(item) && selectedFertilizerCount >= 1) return true
    return false
  }

  const toggleItem = (item: EventShopItem, checked: boolean) => {
    setSelectedItems((prev) => {
      if (!checked) return { ...prev, [item]: false }

      const currentSelectedCount = shopItems.filter((shopItem) => prev[shopItem.key]).length
      if (!prev[item] && currentSelectedCount >= 2) {
        toast({ description: '아이템은 한 번에 최대 2개까지 사용할 수 있습니다.', status: 'error' })
        return prev
      }
      if (fertilizerItems.includes(item) && me.currentLevel >= 7) {
        toast({ description: '7강 이후에는 비료를 사용할 수 없습니다.', status: 'error' })
        return prev
      }
      if (
        fertilizerItems.includes(item) &&
        fertilizerItems.some((fertilizerItem) => fertilizerItem !== item && prev[fertilizerItem])
      ) {
        toast({ description: '비료는 프리미엄/위험한 비료 중 하나만 사용할 수 있습니다.', status: 'error' })
        return prev
      }

      const next = { ...prev, [item]: checked }
      return next
    })
  }

  const handleEnhance = async () => {
    if (isMaxLevel) {
      toast({ description: '이미 최대 강화 단계입니다.', status: 'error' })
      return
    }
    if ((selectedItems.PREMIUM_FERTILIZER || selectedItems.DANGEROUS_FERTILIZER) && me.currentLevel >= 7) {
      toast({ description: '7강 이후에는 비료를 사용할 수 없습니다.', status: 'error' })
      return
    }
    if (selectedItems.PREMIUM_FERTILIZER && selectedItems.DANGEROUS_FERTILIZER) {
      toast({ description: '프리미엄 비료와 위험한 비료는 동시에 사용할 수 없습니다.', status: 'error' })
      return
    }
    if (!selectedItemsUsable) {
      toast({ description: '사용할 수 없는 아이템 선택을 해제해 주세요.', status: 'error' })
      return
    }
    if (me.seedBalance < totalCost) {
      toast({ description: '보유 수박씨가 부족합니다.', status: 'error' })
      return
    }

    setLastResult(null)
    setAnimationState('ENHANCING')
    try {
      const [result] = await Promise.all([
        enhanceMutation.mutateAsync({
          usePremium: selectedItems.PREMIUM_FERTILIZER,
          useDangerous: selectedItems.DANGEROUS_FERTILIZER,
          useDropProj: selectedItems.DROP_PROTECTION,
          useDestroyProj: selectedItems.DESTROY_PROTECTION,
        }),
        wait(800),
      ])
      setSelectedItems((prev) => ({
        DROP_PROTECTION: prev.DROP_PROTECTION && result.dropProtectionCount > 0,
        DESTROY_PROTECTION: prev.DESTROY_PROTECTION && result.destroyProtectionCount > 0,
        PREMIUM_FERTILIZER: prev.PREMIUM_FERTILIZER && result.premiumFertilizerCount > 0,
        DANGEROUS_FERTILIZER:
          prev.DANGEROUS_FERTILIZER && result.dangerousFertilizerCount > 0 && result.afterLevel < 7,
      }))
      setLastResult(result)
      setAnimationState(result.finalOutcome)
      toast({
        description: getOutcomeMessage(result),
        status: result.finalOutcome === 'SUCCESS' ? 'success' : 'info',
      })
      window.setTimeout(() => setAnimationState('IDLE'), 1000)
    } catch {
      setAnimationState('IDLE')
    }
  }

  const watermelonAnimation =
    animationState === 'ENHANCING'
      ? `${enhancePulse} 0.55s ease-in-out infinite`
      : animationState !== 'IDLE'
        ? `${resultPop} 0.35s ease-out`
        : undefined

  return (
    <Box minH="calc(100vh - 80px)" px={{ base: 4, md: 8 }} py={6} bg={pageBg}>
      <Stack spacing={6} maxW="1500px" mx="auto">
        <Stack spacing={1}>
          <Badge colorScheme="pink" w="fit-content">
            SUBAK STORIES
          </Badge>
          <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" color="brand.500">
            수박씨 강화 캠페인
          </Text>
          <Text color={textMuted}>무거운 짐, 캠퍼스에 두고 가세요.</Text>
        </Stack>

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 5 }} spacing={4}>
          <SummaryCard label="보유 수박씨" value={`${me.seedBalance.toLocaleString()}개`} icon="🍉" />
          <SummaryCard label="현재 강화 단계" value={`+${me.currentLevel}`} icon="🌱" />
          <SummaryCard label="최고 강화 단계" value={`+${me.highestLevel}`} icon="🏆" />
          <SummaryCard label="내 랭킹" value={me.rank ? `${me.rank}위` : '-'} icon="🥇" />
          <SummaryCard label="총 시도 횟수" value={`${me.totalAttempts.toLocaleString()}회`} icon="🎯" />
        </SimpleGrid>

        <Grid templateColumns={{ base: '1fr', xl: '370px minmax(0, 1fr) 370px' }} gap={5} alignItems="start">
          <Stack spacing={4}>
            <EventLogPanel logs={logsQuery.data ?? []} isLoading={logsQuery.isLoading} />
            <EventShopPanel
              config={config}
              me={me}
              quantities={quantities}
              setQuantities={setQuantities}
              onBuy={(item) => buyMutation.mutate({ item, quantity: quantities[item] })}
              isBuying={buyMutation.isPending}
            />
          </Stack>

          <Box borderWidth={1} borderColor={borderColor} borderRadius="2xl" bg={panelBg} p={{ base: 4, md: 6 }} shadow="lg">
            <Stack spacing={5}>
              <LevelTrack currentLevel={me.currentLevel} maxLevel={maxLevel} />

              <Box borderRadius="2xl" bg="brand.100" p={{ base: 4, md: 6 }} overflow="hidden">
                <Stack spacing={5} align="center">
                  <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="black" color="brand.700">
                    🌱 수박씨 강화하기 🌱
                  </Text>
                  <HStack
                    w="full"
                    maxW="520px"
                    justify="space-around"
                    borderWidth={1}
                    borderColor="brand.200"
                    borderRadius="2xl"
                    bg="whiteAlpha.900"
                    p={5}
                  >
                    <StageBox label="현재 단계" value={me.currentLevel} />
                    <Text fontSize="4xl" fontWeight="black" color="brand.200">
                      &gt;&gt;&gt;
                    </Text>
                    <StageBox label="다음 단계" value={Math.min(me.currentLevel + 1, maxLevel)} />
                  </HStack>
                  <Box
                    animation={watermelonAnimation}
                    filter={getResultFilter(animationState)}
                    transition="filter 0.2s ease"
                  >
                    <WatermelonLevelImage
                      level={me.currentLevel}
                      boxSize={{ base: '150px', md: '210px' }}
                    />
                  </Box>
                  {animationState === 'ENHANCING' && (
                    <Text fontWeight="bold" color="brand.700">
                      강화 중...
                    </Text>
                  )}
                  {lastResult && animationState !== 'ENHANCING' && (
                    <Badge colorScheme={outcomeSchemes[lastResult.finalOutcome]} fontSize="md" px={3} py={1}>
                      {getOutcomeMessage(lastResult)}
                    </Badge>
                  )}
                </Stack>
              </Box>

              <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" p={4}>
                <Stack spacing={4}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">강화 성공 확률</Text>
                    {me.currentLevel >= 7 && (
                      <Text fontSize="xs" color={textMuted}>
                        7강 이후 위험한 비료 사용 불가
                      </Text>
                    )}
                  </HStack>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                    <ProbabilityBox label="성공" value={formatRate(probabilities.success)} color="green.500" />
                    <ProbabilityBox label="유지" value={formatRate(probabilities.maintain)} color="blue.500" />
                    <ProbabilityBox label="하락" value={formatRate(probabilities.drop)} color="orange.500" />
                    <ProbabilityBox label="파괴" value={formatRate(probabilities.destroy)} color="red.500" />
                  </SimpleGrid>
                  <HStack justify="space-between" borderWidth={1} borderColor={borderColor} borderRadius="lg" p={3}>
                    <Text fontWeight="bold">강화 비용</Text>
                    <Text fontSize="2xl" fontWeight="black" color="brand.500">
                      🍉 {enhanceCost.toLocaleString()}
                    </Text>
                  </HStack>
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <Text fontSize="sm" color={textMuted}>
                      선택 아이템 {selectedItemCount}개 · 강화 비용 {totalCost.toLocaleString()} 수박씨
                    </Text>
                    <Button
                      size="lg"
                      colorScheme="brand"
                      onClick={handleEnhance}
                      isLoading={animationState === 'ENHANCING'}
                      isDisabled={!canEnhance}
                    >
                      {isMaxLevel ? '최대 강화 단계' : '강화하기'}
                    </Button>
                  </HStack>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={4}>
            <RankingPanel
              rankings={rankingsQuery.data?.content ?? []}
              isLoading={rankingsQuery.isLoading}
              myRank={me.rank}
              myUserId={me.userId}
            />
            <InventoryPanel
              me={me}
              selectedItems={selectedItems}
              onToggleItem={toggleItem}
              isItemDisabled={isItemDisabled}
            />
            <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={softPanelBg} p={5}>
              <Stack spacing={2}>
                <Text fontWeight="bold">내 현재 정보</Text>
                <Text fontSize="sm" color={textMuted}>
                  성공 {me.totalSuccesses}회 · 유지 {me.totalMaintains}회 · 하락 {me.totalDrops}회 · 파괴 {me.totalDestroys}회
                </Text>
                <Text fontSize="sm" color={textMuted}>
                  최고 단계 달성: {me.highestLevelAchievedAt ? formatDate(me.highestLevelAchievedAt) : '-'}
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Stack>
    </Box>
  )
}

interface SummaryCardProps {
  label: string
  value: string
  icon: string
}

const SummaryCard = ({ label, value, icon }: SummaryCardProps) => {
  const panelBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('brand.100', 'whiteAlpha.200')
  return (
    <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={panelBg} p={5} shadow="sm">
      <HStack spacing={3}>
        <Text fontSize="3xl">{icon}</Text>
        <Stack spacing={0}>
          <Text fontSize="sm" fontWeight="bold">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="black">
            {value}
          </Text>
        </Stack>
      </HStack>
    </Box>
  )
}

const LevelTrack = ({ currentLevel, maxLevel }: { currentLevel: number; maxLevel: number }) => {
  const borderColor = useColorModeValue('brand.100', 'whiteAlpha.200')
  return (
    <HStack spacing={2} overflowX="auto" overflowY="visible" px={1} pt={2} pb={3}>
      {Array.from({ length: maxLevel }, (_, index) => {
        const level = index + 1
        const isActive = level === currentLevel
        const isRainbow = level === maxLevel
        return (
          <Box
            key={level}
            minW="64px"
            borderWidth={2}
            borderColor={isActive ? 'brand.400' : borderColor}
            borderRadius="xl"
            bg={isActive ? 'brand.50' : 'whiteAlpha.800'}
            p={2}
            textAlign="center"
            transform={isActive ? 'scale(1.06)' : undefined}
            boxShadow={isActive ? (isRainbow ? '0 0 18px rgba(255, 90, 109, 0.8)' : '0 0 14px rgba(255, 90, 109, 0.45)') : undefined}
            transition="all 0.2s ease"
          >
            <Image
              src={`/assets/watermelon-levels/level-${level}.svg`}
              fallback={<Text fontSize="2xl">🍉</Text>}
              alt={`${level}강 수박`}
              mx="auto"
              boxSize="34px"
              objectFit="contain"
            />
            <Text fontSize="xs" fontWeight="bold">
              +{level}
            </Text>
          </Box>
        )
      })}
    </HStack>
  )
}

const WatermelonLevelImage = ({
  level,
  boxSize,
}: {
  level: number
  boxSize: { base: string; md: string }
}) => {
  if (level <= 0) {
    return (
      <Box
        boxSize={boxSize}
        display="grid"
        placeItems="center"
        fontSize={{ base: '96px', md: '132px' }}
        lineHeight={1}
      >
        🌱
      </Box>
    )
  }

  return (
    <Image
      src={`/assets/watermelon-levels/level-${Math.min(level, 10)}.svg`}
      alt={`${level}강 수박`}
      boxSize={boxSize}
      objectFit="contain"
    />
  )
}

const StageBox = ({ label, value }: { label: string; value: number }) => (
  <Stack spacing={2} align="center">
    <Text fontSize="sm" color="gray.600">
      {label}
    </Text>
    <Text
      minW="94px"
      borderWidth={1}
      borderColor="brand.200"
      borderRadius="xl"
      px={4}
      py={2}
      textAlign="center"
      fontSize="4xl"
      fontWeight="black"
      color="brand.600"
      bg="white"
    >
      +{value}
    </Text>
  </Stack>
)

const ProbabilityBox = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <Box borderWidth={1} borderColor="blackAlpha.100" borderRadius="lg" p={3} textAlign="center">
    <Text fontSize="sm" fontWeight="bold" color={color}>
      {label}
    </Text>
    <Text fontSize="2xl" fontWeight="black" color={color}>
      {value}
    </Text>
  </Box>
)

const getResultFilter = (state: EnhanceAnimationState) => {
  if (state === 'SUCCESS') return 'drop-shadow(0 0 24px rgba(72, 187, 120, 0.8))'
  if (state === 'DROP') return 'drop-shadow(0 0 24px rgba(237, 137, 54, 0.8))'
  if (state === 'DESTROY') return 'drop-shadow(0 0 26px rgba(229, 62, 62, 0.9)) grayscale(0.45)'
  if (state === 'MAINTAIN') return 'drop-shadow(0 0 18px rgba(66, 153, 225, 0.6))'
  return undefined
}

const EventLogPanel = ({
  logs,
  isLoading,
}: {
  logs: Array<{
    id: number
    userId: number
    userName?: string
    beforeLevel: number
    afterLevel: number
    finalOutcome: EnhanceOutcome
    rawOutcome: EnhanceOutcome
    createdAt: string
  }>
  isLoading: boolean
}) => {
  const panelBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('brand.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')
  return (
    <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={panelBg} p={5} shadow="sm">
      <Stack spacing={4}>
        <Text fontWeight="bold">서버 강화 로그</Text>
        {isLoading ? (
          <LoadingState label="로그를 불러오는 중입니다." />
        ) : logs.length === 0 ? (
          <EmptyState title="강화 로그가 없습니다" description="아직 기록된 강화 시도가 없습니다." />
        ) : (
          <Stack spacing={2} maxH="320px" overflowY="auto">
            {logs.slice(0, 20).map((log) => (
              <HStack key={log.id} justify="space-between" borderWidth={1} borderColor={borderColor} borderRadius="md" p={3}>
                <Stack spacing={1}>
                  <HStack>
                    <Badge colorScheme={outcomeSchemes[log.finalOutcome]}>{outcomeLabels[log.finalOutcome]}</Badge>
                    <Text fontSize="sm" fontWeight="bold">
                      {log.userName || `user #${log.userId}`}
                    </Text>
                  </HStack>
                  <HStack spacing={2} fontSize="sm" color={textMuted}>
                    <Text>+{log.beforeLevel}</Text>
                    <Text
                      as="span"
                      aria-label="to"
                      borderRadius="full"
                      bg="brand.50"
                      color="brand.500"
                      fontSize="xs"
                      fontWeight="black"
                      lineHeight={1}
                      px={2}
                      py={1}
                    >
                      {'➜'}
                    </Text>
                    <Text>+{log.afterLevel}</Text>
                  </HStack>
                </Stack>
                <Text fontSize="xs" color={textMuted}>
                  {formatDate(log.createdAt)}
                </Text>
              </HStack>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

const EventShopPanel = ({
  config,
  me,
  quantities,
  setQuantities,
  onBuy,
  isBuying,
}: {
  config: WatermelonEventConfig
  me: WatermelonEventMe
  quantities: Record<EventShopItem, number>
  setQuantities: (next: Record<EventShopItem, number>) => void
  onBuy: (item: EventShopItem) => void
  isBuying: boolean
}) => {
  const panelBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('brand.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')
  return (
    <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={panelBg} p={5} shadow="sm">
      <Stack spacing={4}>
        <HStack justify="space-between">
          <Text fontWeight="bold">이벤트 상점</Text>
          <Text fontWeight="bold">🍉 {me.seedBalance.toLocaleString()}</Text>
        </HStack>
        {shopItems.map((item) => (
          <Box key={item.key} borderWidth={1} borderColor={borderColor} borderRadius="lg" p={3}>
            <Stack spacing={3}>
              <HStack justify="space-between">
                <HStack>
                  <Text fontSize="2xl">{item.icon}</Text>
                  <Stack spacing={0}>
                    <Text fontWeight="bold">{item.title}</Text>
                    <Text fontSize="xs" color={textMuted}>
                      {item.description}
                    </Text>
                  </Stack>
                </HStack>
                <Text fontWeight="bold">{Number(config.itemPrices[item.key] ?? 0).toLocaleString()}</Text>
              </HStack>
              <HStack>
                <NumberInput
                  size="sm"
                  min={1}
                  max={99}
                  value={quantities[item.key]}
                  onChange={(_, valueAsNumber) =>
                    setQuantities({
                      ...quantities,
                      [item.key]: Number.isNaN(valueAsNumber) ? 1 : valueAsNumber,
                    })
                  }
                >
                  <NumberInputField />
                </NumberInput>
                <Button size="sm" colorScheme="brand" onClick={() => onBuy(item.key)} isLoading={isBuying}>
                  구매
                </Button>
              </HStack>
            </Stack>
          </Box>
        ))}
        <Text fontSize="xs" color={textMuted} textAlign="center">
          구매한 아이템은 오른쪽 인벤토리에서 확인하세요.
        </Text>
      </Stack>
    </Box>
  )
}

const RankingPanel = ({
  rankings,
  isLoading,
  myRank,
  myUserId,
}: {
  rankings: Array<{ userId: number; username: string; highestLevel: number; totalAttempts: number; highestLevelAchievedAt: string | null }>
  isLoading: boolean
  myRank: number
  myUserId: number
}) => {
  const panelBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('brand.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')
  return (
    <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={panelBg} p={5} shadow="sm">
      <Stack spacing={4}>
        <Text fontWeight="bold">강화 랭킹</Text>
        {isLoading ? (
          <LoadingState label="랭킹을 불러오는 중입니다." />
        ) : (
          <Stack spacing={2} maxH="360px" overflowY="auto" pr={1}>
            {rankings.map((entry, index) => {
              const isMe = entry.userId === myUserId
              return (
                <HStack
                  key={entry.userId}
                  justify="space-between"
                  borderWidth={1}
                  borderColor={isMe ? 'brand.300' : borderColor}
                  borderRadius="md"
                  bg={isMe ? 'brand.50' : undefined}
                  p={3}
                >
                  <HStack>
                    <Text fontWeight="black" minW="24px">
                      {index + 1}
                    </Text>
                    <Text>🍉</Text>
                    <Stack spacing={0}>
                      <Text fontWeight="bold">{isMe ? '나' : entry.username}</Text>
                      <Text fontSize="xs" color={textMuted}>
                        시도 {entry.totalAttempts}회
                      </Text>
                    </Stack>
                  </HStack>
                  <Text fontWeight="black">+{entry.highestLevel}</Text>
                </HStack>
              )
            })}
          </Stack>
        )}
        <Divider />
        <Text fontSize="sm" color={textMuted}>
          내 순위: {myRank ? `${myRank}위` : '-'}
        </Text>
      </Stack>
    </Box>
  )
}

const InventoryPanel = ({
  me,
  selectedItems,
  onToggleItem,
  isItemDisabled,
}: {
  me: WatermelonEventMe
  selectedItems: Record<EventShopItem, boolean>
  onToggleItem: (item: EventShopItem, checked: boolean) => void
  isItemDisabled: (item: EventShopItem) => boolean
}) => {
  const panelBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('brand.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')
  return (
    <Box borderWidth={1} borderColor={borderColor} borderRadius="xl" bg={panelBg} p={5} shadow="sm">
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Text fontWeight="bold">내 아이템 보유 현황</Text>
          <Text fontSize="xs" color={textMuted}>
            아이템은 한 번에 최대 2개까지 사용할 수 있고, 비료는 7강 이후 사용할 수 없습니다.
          </Text>
        </Stack>
        {shopItems.map((item) => {
          const count = Number(me[itemCountKeys[item.key]] ?? 0)
          const isChecked = selectedItems[item.key]
          const isDisabled = isItemDisabled(item.key)
          return (
            <Checkbox
              key={item.key}
              w="full"
              isChecked={isChecked}
              isDisabled={isDisabled}
              onChange={(event) => onToggleItem(item.key, event.target.checked)}
            >
              <HStack
                w="full"
                justify="space-between"
                p={3}
                opacity={isDisabled ? 0.64 : 1}
              >
                <HStack minW={0}>
                  <Text fontSize="2xl">{item.icon}</Text>
                  <Text fontWeight="bold">{item.title}</Text>
                </HStack>
                <Text fontWeight="black">{count}개</Text>
              </HStack>
            </Checkbox>
          )
        })}
      </Stack>
    </Box>
  )
}
