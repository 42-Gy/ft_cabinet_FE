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
import { useCabinetSummaryQuery } from '@/features/lockers/hooks/useLockerData'
import { UsageSummary } from '@/features/status/components/UsageSummary'
import type { CabinetSummary, CabinetSummaryAll } from '@/types/locker'

const guideCards = [
  {
    title: '사물함 대여법',
    summary: '캠퍼스에서 사용할 사물함을 바로 찾아 대여하세요.',
    detail:
      '42 계정으로 로그인한 뒤 사물함 페이지에서 사용하고 싶은 구역을 선택하면 지금 비어 있는 사물함을 바로 확인할 수 있어요. 원하는 사물함을 고르고 대여하기를 누르면 내 사물함으로 즉시 등록되어 바로 사용 가능합니다.',
  },
  {
    title: '수박 얻는 법',
    summary: '출석하고 공부하면서 수박씨를 모아보세요.',
    detail:
      '하루에 한 번 출석체크를 하고, 클러스터에서 50시간 이상 활동하면 다음 달 사용할 수 있는 수박씨가 지급돼요. 모은 수박씨는 상점에서 아이템을 구매하는 데 사용할 수 있어요.',
  },
  {
    title: '수박 상점 안내서',
    summary: '사물함에 필요한 아이템을 한 곳에서 관리하세요.',
    detail:
      '상점에서 대여권, 연장권, 이사권 같은 필요한 아이템을 바로 구매할 수 있어요. 구매한 아이템은 내 사물함에서 바로 적용할 수 있어 사물함 이용을 더 편리하게 만들어줘요.',
  },
]

interface HomeOverviewProps {
  summaryAll?: CabinetSummaryAll | null
  summaryError?: boolean
  summaryLoading?: boolean
  onRetry?: () => void
  isLoggedIn?: boolean
}

export const HomeOverview = ({
  summaryAll,
  summaryError,
  summaryLoading,
  onRetry,
  isLoggedIn = false,
}: HomeOverviewProps) => {
  const guideModal = useDisclosure()
  const summary2F = useCabinetSummaryQuery({ floor: 2, enabled: isLoggedIn })
  const summary3F = useCabinetSummaryQuery({ floor: 3, enabled: isLoggedIn })
  const highlightBg = useColorModeValue('white', 'gray.800')
  const highlightBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const sectionText = useColorModeValue('gray.600', 'gray.300')
  const guideIconColor = useColorModeValue('leaf.500', 'leaf.300')
  const guideBorderWidth = useColorModeValue(0, 0)
  const guideBorderColor = useColorModeValue('gray.100', 'transparent')
  const guideGradients = {
    rent: useColorModeValue('linear(to-b, #e0f7ff, #f5fbff)', 'linear(to-b, gray.800, gray.700)'),
    seed: useColorModeValue('linear(to-b, #e7f8ed, #f6fff8)', 'linear(to-b, gray.800, gray.700)'),
    store: useColorModeValue('linear(to-b, #fef2f2, #fff5ee)', 'linear(to-b, gray.800, gray.700)'),
  }
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

  const resolvedSummary = summaryAll
  const isLoading = Boolean(summaryLoading)
  const isError = Boolean(summaryError)

  if (isLoading) return <LoadingState label="사물함 현황을 불러오는 중입니다." />
  if (isError) return <ErrorState onRetry={onRetry} />
  if (!resolvedSummary) return <EmptyState title="등록된 락커가 없습니다" />

  const { totalCounts, totalAvailable, totalFull, totalBroken } = resolvedSummary

  return (
    <Stack spacing={10} w="full">
      <Box borderRadius="2xl" borderWidth={guideBorderWidth} borderColor={guideBorderColor}>
        <Box pt={6}>
          <Text fontWeight="bold" mb={4}>
            SUBAK 안내서
          </Text>
        </Box>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} pb={6}>
          {guideCards.map((guide) => (
            <Box
              key={guide.title}
              borderRadius="xl"
              borderWidth={guideBorderWidth}
              borderColor={guideBorderColor}
              cursor="pointer"
              p={10}
              minH="260px"
              textAlign="center"
              bgGradient={
                guide.title === '사물함 대여법'
                  ? guideGradients.rent
                  : guide.title === '수박 얻는 법'
                    ? guideGradients.seed
                    : guideGradients.store
              }
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
                color={guideIconColor}
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
