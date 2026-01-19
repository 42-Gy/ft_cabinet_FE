import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { RiLockUnlockLine, RiSeedlingLine, RiStore2Line } from 'react-icons/ri'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { LoadingState } from '@/components/molecules/LoadingState'
import { cabinetSections, extractSectionId } from '@/features/lockers/data/cabinetSections'
import {
  useCabinetSummaryAllQuery,
  useCabinetSummaryQuery,
} from '@/features/lockers/hooks/useLockerData'
import { UsageSummary } from '@/features/status/components/UsageSummary'
import type { CabinetSummary, CabinetSummaryAll } from '@/types/locker'

const guideCards = [
  {
    title: '사물함 대여법',
    summary: '지도에서 섹션을 선택하고 Drawer로 상세 상태를 확인하세요.',
    detail:
      '42 OAuth 로그인 후 사물함 페이지에서 원하는 섹션을 고르면 AVAILABLE 카드가 Drawer와 함께 나타납니다. “이 사물함 대여하기” 버튼을 누르면 TanStack Query가 자동 갱신되어 /my/lockers에서 대여 내용을 즉시 확인하고 관리할 수 있습니다.',
  },
  {
    title: '수박 얻는 법',
    summary: '출석 · 씨앗 심기 · 공부 50시간 루틴으로 수박씨를 모읍니다.',
    detail:
      '출석 화면에서 하루 한 번 씨앗을 심고, 클러스터 Logtime 50시간을 채우면 다음 달 1일에 1,000 수박씨가 들어옵니다. 모든 코인은 스토어/아이템 사용과 바로 연계됩니다.',
  },
  {
    title: '수박 상점 안내서',
    summary: '대여권/연장권/이사권/감면권을 한 곳에서 구매·사용하세요.',
    detail:
      '스토어 화면에서 원하는 티켓을 고르면 해당 카드만 로딩되며, 구매 성공 시 Query invalidate로 코인 및 아이템 목록이 즉시 갱신됩니다. 보유한 티켓은 /my/lockers에서 “사용” 버튼으로 바로 적용할 수 있습니다.',
  },
]

interface HomeOverviewProps {
  summaryAll?: CabinetSummaryAll | null
  summaryError?: boolean
  onRetry?: () => void
}

export const HomeOverview = ({ summaryAll, summaryError, onRetry }: HomeOverviewProps) => {
  const guideModal = useDisclosure()
  const summaryQuery = useCabinetSummaryAllQuery()
  const summary2F = useCabinetSummaryQuery({ floor: 2, enabled: true })
  const summary3F = useCabinetSummaryQuery({ floor: 3, enabled: true })
  const highlightBg = useColorModeValue('white', 'gray.800')
  const highlightBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const sectionText = useColorModeValue('gray.600', 'gray.300')
  const [activeGuide, setActiveGuide] = useState<(typeof guideCards)[number] | null>(null)
  const statusColors = {
    available: useColorModeValue('leaf.400', 'leaf.300'),
    full: useColorModeValue('brand.400', 'brand.300'),
    broken: useColorModeValue('orange.400', 'orange.300'),
  }

  const sectionSummaryMap = useMemo(() => {
    const map = new Map<
      number,
      { available: number; full: number; broken: number; total: number }
    >()
    const apply = (items?: CabinetSummary[] | unknown) => {
      if (!Array.isArray(items)) return
      items.forEach((item) => {
        const id = extractSectionId(item.section)
        if (!id) return
        map.set(id, {
          available: item.availableCount,
          full: item.fullCount,
          broken: item.brokenCount,
          total: item.total,
        })
      })
    }
    apply(summary2F.data)
    apply(summary3F.data)
    return map
  }, [summary2F.data, summary3F.data])

  const sectionSummaryLoading = summary2F.isLoading || summary3F.isLoading
  const sectionSummaryError = summary2F.isError || summary3F.isError
  const floorSummaries = useMemo(() => {
    const toStats = (data?: CabinetSummary[] | null | unknown) => {
      if (!Array.isArray(data) || data.length === 0) return null
      return data.reduce(
        (acc, item) => {
          acc.total += item.total
          acc.available += item.availableCount
          acc.occupied += item.fullCount
          acc.maintenance += item.brokenCount
          return acc
        },
        { total: 0, available: 0, occupied: 0, maintenance: 0 },
      )
    }
    const floors = []
    const stats2F = toStats(summary2F.data)
    if (stats2F) floors.push({ floor: 2, ...stats2F })
    const stats3F = toStats(summary3F.data)
    if (stats3F) floors.push({ floor: 3, ...stats3F })
    return floors
  }, [summary2F.data, summary3F.data])

  const resolvedSummary = summaryAll ?? summaryQuery.data
  const isLoading = summaryAll === undefined ? summaryQuery.isLoading : false
  const isError = summaryError ?? summaryQuery.isError

  if (isLoading) return <LoadingState label="락커 현황을 불러오는 중입니다." />
  if (isError) return <ErrorState onRetry={onRetry ?? summaryQuery.refetch} />
  if (!resolvedSummary) return <EmptyState title="등록된 락커가 없습니다" />

  const { totalCounts, totalAvailable, totalFull, totalBroken } = resolvedSummary

  return (
    <Stack spacing={10} w="full">
      <Box borderRadius="2xl" borderWidth={1} borderColor="whiteAlpha.200" p={6}>
        <Text fontWeight="bold" mb={4}>
          SUBAK Stories
        </Text>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {guideCards.map((guide) => (
            <Box
              key={guide.title}
              borderRadius="xl"
              borderWidth={1}
              borderColor="whiteAlpha.200"
              p={6}
              cursor="pointer"
              minH="260px"
              textAlign="center"
              bgGradient={useColorModeValue(
                guide.title === '사물함 대여법'
                  ? 'linear(to-b, #e0f7ff, #f5fbff)'
                  : guide.title === '수박 얻는 법'
                    ? 'linear(to-b, #e7f8ed, #f6fff8)'
                    : 'linear(to-b, #fef2f2, #fff5ee)',
                'linear(to-b, gray.800, gray.700)',
              )}
              _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
              transition="all 0.2s"
              onClick={() => {
                setActiveGuide(guide)
                guideModal.onOpen()
              }}
            >
              <Icon
                as={
                  guide.title === '사물함 대여법'
                    ? RiLockUnlockLine
                    : guide.title === '수박 얻는 법'
                      ? RiSeedlingLine
                      : RiStore2Line
                }
                boxSize={12}
                mb={3}
                color={useColorModeValue('leaf.500', 'leaf.300')}
              />
              <Text fontWeight="semibold" fontSize="xl" mb={4}>
                {guide.title}
              </Text>
              <Text fontSize="md" color={sectionText}>
                {guide.summary}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <UsageSummary
        total={totalCounts}
        available={totalAvailable}
        occupied={totalFull}
        maintenance={totalBroken}
        floors={floorSummaries}
      />

      <Box>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          섹션 하이라이트
        </Text>
        {sectionSummaryError && (
          <Text fontSize="sm" color="red.400" mb={2}>
            섹션별 현황을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
          </Text>
        )}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          {cabinetSections.map((section) => (
            <Box
              key={section.id}
              borderRadius="xl"
              bg={highlightBg}
              p={5}
              borderWidth={1}
              borderColor={highlightBorder}
              shadow="sm"
            >
              <Badge colorScheme="brand" mb={2}>
                {section.title}
              </Badge>
              {sectionSummaryLoading ? (
                <Skeleton height="92px" borderRadius="md" />
              ) : (
                (() => {
                  const stats = sectionSummaryMap.get(section.id)
                  if (!stats) {
                    return <Text color="gray.400">로그인 후 확인할 수 있습니다.</Text>
                  }
                  const blocks = [
                    { label: '대여 가능', value: stats.available, color: statusColors.available },
                    { label: '사용 중', value: stats.full, color: statusColors.full },
                    { label: '점검 중', value: stats.broken, color: statusColors.broken },
                  ] as const
                  const total = stats.total || stats.available + stats.full + stats.broken || 1
                  const availablePercent = Math.min(
                    100,
                    Math.round((stats.available / total) * 100),
                  )
                  return (
                    <Stack spacing={2}>
                      <HStack spacing={2} align="center">
                        <Box flex={1} h={2} borderRadius="full" bg="gray.100" overflow="hidden">
                          <Box
                            h="full"
                            bg={statusColors.available}
                            width={`${availablePercent}%`}
                          />
                        </Box>
                        <Text fontSize="xs" color={sectionText}>
                          총 {total}개
                        </Text>
                      </HStack>
                      {blocks.map((block) => (
                        <HStack key={block.label} justify="space-between">
                          <HStack spacing={2}>
                            <Box w={3} h={3} borderRadius="full" bg={block.color} />
                            <Text fontSize="sm" color={sectionText}>
                              {block.label}
                            </Text>
                          </HStack>
                          <Text fontWeight="bold">{block.value}</Text>
                        </HStack>
                      ))}
                    </Stack>
                  )
                })()
              )}
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Modal isOpen={guideModal.isOpen} onClose={guideModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{activeGuide?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{activeGuide?.detail}</Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={guideModal.onClose} colorScheme="brand">
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  )
}
