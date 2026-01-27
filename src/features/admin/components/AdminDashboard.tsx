import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import {
  useAdminBrokenCabinetsQuery,
  useAdminCabinetDetailQuery,
  useAdminCabinetHistoryQuery,
  useAdminCoinStatsQuery,
  useAdminDashboardQuery,
  useAdminFloorStatsQuery,
  useAdminItemUsageStatsQuery,
  useAdminOverdueCabinetsQuery,
  useAdminPendingCabinetsQuery,
  useAdminPenaltyUsersQuery,
  useAdminStoreStatsQuery,
  useAdminUserQuery,
  useAdminWeeklyStatsQuery,
  useCabinetForceReturnMutation,
  useCabinetStatusBundleMutation,
  useCabinetStatusMutation,
  useCoinProvideMutation,
  useCoinRevokeMutation,
  useEmergencyNoticeMutation,
  useItemGrantMutation,
  useItemPriceUpdateMutation,
  useItemRevokeMutation,
  useLogtimeUpdateMutation,
  useAdminRoleDemoteMutation,
  useAdminRolePromoteMutation,
  usePenaltyAssignMutation,
  usePenaltyRemoveMutation,
  usePendingCabinetApproveMutation,
} from '@/features/admin/hooks/useAdminDashboard'
import type {
  AdminBrokenCabinet,
  AdminCoinStatsPoint,
  AdminFloorStatsItem,
  AdminItemUsageStat,
  AdminPenaltyUser,
  AdminWeeklyStatsPoint,
  CabinetLentType,
  CabinetStatusValue,
} from '@/features/admin/types'
import { useCabinetsQuery } from '@/features/lockers/hooks/useLockerData'
import { extractSectionId, getSectionsByFloor } from '@/features/lockers/data/cabinetSections'
import type { Cabinet } from '@/types/locker'

type ChartSegment = {
  label: string
  value: number
  color: string
}

const cabinetStatusOptions: CabinetStatusValue[] = [
  'AVAILABLE',
  'FULL',
  'OVERDUE',
  'BROKEN',
  'DISABLED',
  'PENDING',
]
const cabinetLentTypeOptions: CabinetLentType[] = ['PRIVATE', 'SHARE', 'CLUB']

const itemGrantOptions = [
  { label: '대여권', value: 'LENT' },
  { label: '연장권', value: 'EXTENSION' },
  { label: '이사권', value: 'SWAP' },
  { label: '패널티 감면권', value: 'PENALTY_EXEMPTION' },
]

const priceItemOptions = [
  { label: '대여권', value: 'LENT' },
  { label: '연장권', value: 'EXTENSION' },
  { label: '이사권', value: 'SWAP' },
  { label: '패널티 감면권', value: 'PENALTY_EXEMPTION' },
]

const formatNumber = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })

const buildConicGradient = (segments: ChartSegment[], fallbackColor: string) => {
  const total = segments.reduce((sum, segment) => sum + Math.max(segment.value, 0), 0)
  if (total <= 0) return { gradient: fallbackColor, total }
  let accumulated = 0
  const stops = segments
    .map((segment) => {
      const start = (accumulated / total) * 360
      accumulated += Math.max(segment.value, 0)
      const end = (accumulated / total) * 360
      return `${segment.color} ${start}deg ${end}deg`
    })
    .join(', ')
  return { gradient: `conic-gradient(${stops})`, total }
}

const DonutChart = ({
  title,
  segments,
  centerLabel,
  centerSubLabel,
}: {
  title: string
  segments: ChartSegment[]
  centerLabel?: string
  centerSubLabel?: string
}) => {
  const chartBg = useColorModeValue('gray.50', 'gray.700')
  const holeBg = useColorModeValue('white', 'gray.800')
  const mutedText = useColorModeValue('gray.600', 'gray.300')
  const fallbackColor = useColorModeValue('#e2e8f0', '#4a5568')
  const { gradient, total } = buildConicGradient(segments, fallbackColor)

  return (
    <Box borderWidth={1} borderRadius="xl" p={5} bg={chartBg}>
      <Text fontWeight="bold" mb={4}>
        {title}
      </Text>
      <HStack align="stretch" spacing={6} flexWrap="wrap">
        <Box position="relative" boxSize="220px" flexShrink={0}>
          <Box boxSize="220px" borderRadius="full" bgImage={gradient} />
          <Box
            position="absolute"
            inset="26px"
            borderRadius="full"
            bg={holeBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            px={4}
          >
            <Stack spacing={0}>
              <Text fontSize="2xl" fontWeight="black">
                {centerLabel ?? formatNumber(total)}
              </Text>
              {centerSubLabel && (
                <Text fontSize="sm" color={mutedText}>
                  {centerSubLabel}
                </Text>
              )}
            </Stack>
          </Box>
        </Box>
        <Stack spacing={2} minW="180px" flex={1}>
          {segments.map((segment) => (
            <HStack key={segment.label} justify="space-between">
              <HStack spacing={2}>
                <Box boxSize="10px" borderRadius="full" bg={segment.color} />
                <Text fontSize="sm" color={mutedText}>
                  {segment.label}
                </Text>
              </HStack>
              <Text fontWeight="semibold">{formatNumber(segment.value)}</Text>
            </HStack>
          ))}
        </Stack>
      </HStack>
    </Box>
  )
}

const LineChart = ({
  title,
  firstSeries,
  secondSeries,
  firstLabel,
  secondLabel,
}: {
  title: string
  firstSeries: AdminWeeklyStatsPoint[] | AdminCoinStatsPoint[]
  secondSeries: AdminWeeklyStatsPoint[] | AdminCoinStatsPoint[]
  firstLabel: string
  secondLabel: string
}) => {
  const chartBg = useColorModeValue('white', 'gray.800')
  const gridColor = useColorModeValue('#e2e8f0', '#2d3748')
  const firstColor = useColorModeValue('#38a169', '#68d391')
  const secondColor = useColorModeValue('#805ad5', '#b794f4')
  const mutedText = useColorModeValue('gray.600', 'gray.300')

  const points = useMemo(() => {
    const raw = firstSeries.map((point, index) => {
      const firstValue = 'lentsStarted' in point ? point.lentsStarted : point.issuedAmount
      const secondValue = 'lentsEnded' in secondSeries[index]
        ? (secondSeries[index] as AdminWeeklyStatsPoint).lentsEnded
        : (secondSeries[index] as AdminCoinStatsPoint).usedAmount
      return {
        label: point.weekLabel,
        firstValue,
        secondValue,
      }
    })

    const maxValue = raw.reduce((max, point) => Math.max(max, point.firstValue, point.secondValue), 0)
    const safeMax = maxValue <= 0 ? 1 : maxValue
    const width = 640
    const height = 220
    const paddingX = 36
    const paddingY = 24
    const innerWidth = width - paddingX * 2
    const innerHeight = height - paddingY * 2

    const toPoint = (value: number, index: number) => {
      const x = paddingX + (innerWidth * index) / Math.max(raw.length - 1, 1)
      const y = paddingY + innerHeight - (innerHeight * value) / safeMax
      return { x, y }
    }

    const firstPoints = raw.map((point, index) => toPoint(point.firstValue, index))
    const secondPoints = raw.map((point, index) => toPoint(point.secondValue, index))

    return {
      width,
      height,
      paddingX,
      paddingY,
      innerWidth,
      innerHeight,
      safeMax,
      labels: raw.map((point) => point.label),
      firstPoints,
      secondPoints,
      firstValues: raw.map((point) => point.firstValue),
      secondValues: raw.map((point) => point.secondValue),
    }
  }, [firstSeries, secondSeries])

  const buildPath = (series: { x: number; y: number }[]) =>
    series.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ')

  const yTicks = 4
  const tickValues = Array.from({ length: yTicks + 1 }, (_, index) =>
    Math.round((points.safeMax * index) / yTicks),
  ).reverse()

  return (
    <Box borderWidth={1} borderRadius="xl" p={5} bg={chartBg}>
      <HStack justify="space-between" mb={3} align="flex-start" flexWrap="wrap" gap={3}>
        <Text fontWeight="bold">{title}</Text>
        <HStack spacing={4}>
          <HStack spacing={2}>
            <Box boxSize="10px" borderRadius="full" bg={firstColor} />
            <Text fontSize="sm" color={mutedText}>
              {firstLabel}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Box boxSize="10px" borderRadius="full" bg={secondColor} />
            <Text fontSize="sm" color={mutedText}>
              {secondLabel}
            </Text>
          </HStack>
        </HStack>
      </HStack>
      <Box overflowX="auto">
        <Box minW="680px">
          <svg viewBox={`0 0 ${points.width} ${points.height}`} width="100%" height="220">
            {tickValues.map((tick) => {
              const ratio = tick / Math.max(points.safeMax, 1)
              const y = points.paddingY + points.innerHeight - points.innerHeight * ratio
              return (
                <g key={tick}>
                  <line
                    x1={points.paddingX}
                    x2={points.paddingX + points.innerWidth}
                    y1={y}
                    y2={y}
                    stroke={gridColor}
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <text
                    x={points.paddingX - 10}
                    y={y + 4}
                    fontSize="11"
                    textAnchor="end"
                    fill={gridColor}
                  >
                    {formatNumber(tick)}
                  </text>
                </g>
              )
            })}
            <path d={buildPath(points.firstPoints)} fill="none" stroke={firstColor} strokeWidth="3" />
            <path d={buildPath(points.secondPoints)} fill="none" stroke={secondColor} strokeWidth="3" />
            {points.firstPoints.map((point, index) => (
              <g key={`first-${points.labels[index]}`}>
                <circle cx={point.x} cy={point.y} r="5" fill={firstColor} />
                <text
                  x={point.x}
                  y={point.y - 10}
                  fontSize="11"
                  textAnchor="middle"
                  fill={firstColor}
                >
                  {formatNumber(points.firstValues[index])}
                </text>
              </g>
            ))}
            {points.secondPoints.map((point, index) => (
              <g key={`second-${points.labels[index]}`}>
                <circle cx={point.x} cy={point.y} r="5" fill={secondColor} />
                <text
                  x={point.x}
                  y={point.y + 18}
                  fontSize="11"
                  textAnchor="middle"
                  fill={secondColor}
                >
                  {formatNumber(points.secondValues[index])}
                </text>
              </g>
            ))}
            {points.labels.map((label, index) => {
              const x = points.paddingX + (points.innerWidth * index) / Math.max(points.labels.length - 1, 1)
              const y = points.paddingY + points.innerHeight + 24
              return (
                <text
                  key={`label-${label}`}
                  x={x}
                  y={y}
                  fontSize="11"
                  textAnchor="middle"
                  fill={gridColor}
                >
                  {label}
                </text>
              )
            })}
          </svg>
        </Box>
      </Box>
    </Box>
  )
}

const InfoTable = ({
  title,
  columns,
  rows,
  emptyTitle,
}: {
  title: string
  columns: string[]
  rows: Array<Array<string | number>>
  emptyTitle: string
}) => {
  const headerBg = useColorModeValue('brand.500', 'brand.600')
  const headerColor = 'white'
  const rowBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')

  return (
    <Box borderWidth={1} borderRadius="xl" overflow="hidden" borderColor={borderColor}>
      <Box px={5} py={4} borderBottomWidth={1} borderColor={borderColor}>
        <Text fontWeight="bold">{title}</Text>
      </Box>
      {rows.length === 0 ? (
        <Box p={6}>
          <EmptyState title={emptyTitle} />
        </Box>
      ) : (
        <Box overflowX="auto">
          <Box minW="520px">
            <SimpleGrid columns={columns.length} bg={headerBg} color={headerColor} px={4} py={3}>
              {columns.map((column) => (
                <Text key={column} fontWeight="bold" fontSize="sm">
                  {column}
                </Text>
              ))}
            </SimpleGrid>
            <Stack spacing={0}>
              {rows.map((row, index) => (
                <SimpleGrid
                  key={`${title}-${index}`}
                  columns={columns.length}
                  px={4}
                  py={3}
                  bg={rowBg}
                  borderBottomWidth={index === rows.length - 1 ? 0 : 1}
                  borderColor={borderColor}
                >
                  {row.map((cell, cellIndex) => (
                    <Text key={`${title}-${index}-${cellIndex}`} fontSize="sm" fontWeight="medium">
                      {cell}
                    </Text>
                  ))}
                </SimpleGrid>
              ))}
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  )
}

const statusLabels: Record<CabinetStatusValue, string> = {
  AVAILABLE: '사용 가능',
  FULL: '사용 중',
  OVERDUE: '연체',
  BROKEN: '고장',
  DISABLED: '사용 중지',
  PENDING: '승인 대기',
}

export const AdminDashboard = () => {
  const statsQuery = useAdminDashboardQuery()
  const floorStatsQuery = useAdminFloorStatsQuery()
  const weeklyQuery = useAdminWeeklyStatsQuery()
  const storeQuery = useAdminStoreStatsQuery()
  const coinStatsQuery = useAdminCoinStatsQuery()
  const itemUsageQuery = useAdminItemUsageStatsQuery()
  const pendingQuery = useAdminPendingCabinetsQuery()
  const overdueQuery = useAdminOverdueCabinetsQuery()
  const penaltyUsersQuery = useAdminPenaltyUsersQuery()
  const brokenCabinetsQuery = useAdminBrokenCabinetsQuery()

  const [nameInput, setNameInput] = useState('')
  const [searchedName, setSearchedName] = useState<string | undefined>(undefined)
  const userQuery = useAdminUserQuery(searchedName)

  const coinMutation = useCoinProvideMutation()
  const coinRevokeMutation = useCoinRevokeMutation()
  const penaltyAssignMutation = usePenaltyAssignMutation()
  const penaltyRemoveMutation = usePenaltyRemoveMutation()
  const itemGrantMutation = useItemGrantMutation()
  const itemRevokeMutation = useItemRevokeMutation()
  const logtimeMutation = useLogtimeUpdateMutation()
  const adminPromoteMutation = useAdminRolePromoteMutation()
  const adminDemoteMutation = useAdminRoleDemoteMutation()
  const cabinetStatusMutation = useCabinetStatusMutation()
  const cabinetBundleMutation = useCabinetStatusBundleMutation()
  const forceReturnMutation = useCabinetForceReturnMutation()
  const approvePendingMutation = usePendingCabinetApproveMutation()
  const itemPriceMutation = useItemPriceUpdateMutation()
  const emergencyNoticeMutation = useEmergencyNoticeMutation()

  const [coinAmount, setCoinAmount] = useState('100')
  const [coinReason, setCoinReason] = useState('관리자 지급')
  const [coinRevokeReason, setCoinRevokeReason] = useState('지급 오류 회수')
  const [penaltyDays, setPenaltyDays] = useState('1')
  const [penaltyReason, setPenaltyReason] = useState('관리자 부여')
  const [itemName, setItemName] = useState(itemGrantOptions[0].value)
  const [itemReason, setItemReason] = useState('관리자 지급')
  const [itemRevokeName, setItemRevokeName] = useState(itemGrantOptions[0].value)
  const [itemRevokeAmount, setItemRevokeAmount] = useState('1')
  const [logtimeValue, setLogtimeValue] = useState('0')

  const [cabinetNumInput, setCabinetNumInput] = useState('')
  const [cabinetStatus, setCabinetStatus] = useState<CabinetStatusValue>('AVAILABLE')
  const [cabinetLentType, setCabinetLentType] = useState<CabinetLentType>('PRIVATE')
  const [cabinetNote, setCabinetNote] = useState('')
  const [historyPage, setHistoryPage] = useState(0)
  const [historySize] = useState(10)

  const [priceItemName, setPriceItemName] = useState(priceItemOptions[0].value)
  const [priceValue, setPriceValue] = useState('1000')
  const [emergencyMessage, setEmergencyMessage] = useState(
    '긴급 점검으로 인해 14:00~15:00 서비스 이용이 제한됩니다.',
  )

  const [adminFloor, setAdminFloor] = useState<2 | 3>(2)
  const [floorStatsScope, setFloorStatsScope] = useState<'all' | 2 | 3>('all')
  const [selectedSectionIds, setSelectedSectionIds] = useState<number[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<CabinetStatusValue[]>([])
  const [selectedCabinetIds, setSelectedCabinetIds] = useState<number[]>([])
  const [bundleStatus, setBundleStatus] = useState<CabinetStatusValue>('BROKEN')
  const [bundleNote, setBundleNote] = useState('')

  const cabinetsQuery = useCabinetsQuery({ floor: adminFloor, enabled: true })

  const highlightBg = useColorModeValue('white', 'gray.800')
  const highlightBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const tileSelectedBorder = useColorModeValue('brand.400', 'brand.300')
  const tileDefaultBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const statusAvailableColor = useColorModeValue('#38a169', '#68d391')
  const statusFullColor = useColorModeValue('#805ad5', '#b794f4')
  const statusOverdueColor = useColorModeValue('#dd6b20', '#f6ad55')
  const statusBrokenColor = useColorModeValue('#4a5568', '#a0aec0')
  const statusDisabledColor = useColorModeValue('#1a202c', '#718096')
  const statusPendingColor = useColorModeValue('#d69e2e', '#f6e05e')
  const itemHeaderBg = useColorModeValue('brand.500', 'brand.600')

  const tileBgAvailable = useColorModeValue('leaf.500', 'leaf.600')
  const tileBgFull = useColorModeValue('brand.500', 'brand.600')
  const tileBgOverdue = useColorModeValue('orange.500', 'orange.600')
  const tileBgBroken = useColorModeValue('gray.500', 'gray.600')
  const tileBgDisabled = useColorModeValue('gray.700', 'gray.700')
  const tileBgPending = useColorModeValue('yellow.400', 'yellow.500')

  const statusColors = {
    AVAILABLE: statusAvailableColor,
    FULL: statusFullColor,
    OVERDUE: statusOverdueColor,
    BROKEN: statusBrokenColor,
    DISABLED: statusDisabledColor,
    PENDING: statusPendingColor,
  } as const

  const tileBgByStatus: Record<CabinetStatusValue, string> = {
    AVAILABLE: tileBgAvailable,
    FULL: tileBgFull,
    OVERDUE: tileBgOverdue,
    BROKEN: tileBgBroken,
    DISABLED: tileBgDisabled,
    PENDING: tileBgPending,
  }

  const handleUserSearch = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setSearchedName(trimmed)
  }

  const userData = userQuery.data
  const cabinetNumber = Number(cabinetNumInput)
  const isCabinetNumberValid = !Number.isNaN(cabinetNumber) && cabinetNumber > 0
  const cabinetDetailQuery = useAdminCabinetDetailQuery(
    isCabinetNumberValid ? cabinetNumber : undefined,
  )
  const cabinetHistoryQuery = useAdminCabinetHistoryQuery(
    isCabinetNumberValid ? cabinetNumber : undefined,
    historyPage,
    historySize,
  )

  const dashboardCards = useMemo(() => {
    if (!statsQuery.data) return []
    const stats = statsQuery.data
    return [
      { label: '전체 유저', value: formatNumber(stats.totalUserCount) },
      { label: '전체 사물함', value: formatNumber(stats.totalCabinetCount) },
      { label: '대여 중', value: formatNumber(stats.activeLentCount) },
      { label: '점검 중', value: formatNumber(stats.brokenCabinetCount) },
      { label: '패널티 유저', value: formatNumber(stats.bannedUserCount) },
    ]
  }, [statsQuery.data])

  const floorStats = useMemo<AdminFloorStatsItem[]>(() => {
    const floors = floorStatsQuery.data?.floors
    return Array.isArray(floors) ? floors : []
  }, [floorStatsQuery.data?.floors])

  const scopedFloorStats = useMemo(() => {
    if (floorStatsScope === 'all') return floorStats
    return floorStats.filter((item) => item.floor === floorStatsScope)
  }, [floorStats, floorStatsScope])

  const floorAggregate = useMemo(() => {
    if (!scopedFloorStats.length) {
      return { total: 0, available: 0, used: 0, overdue: 0, broken: 0, pending: 0, disabled: 0 }
    }
    return scopedFloorStats.reduce(
      (acc, item) => {
        acc.total += item.total
        acc.available += item.available
        acc.used += item.used
        acc.overdue += item.overdue
        acc.broken += item.broken
        acc.pending += item.pending
        acc.disabled += item.disabled ?? 0
        return acc
      },
      { total: 0, available: 0, used: 0, overdue: 0, broken: 0, pending: 0, disabled: 0 },
    )
  }, [scopedFloorStats])

  const floorAggregateSegments = useMemo<ChartSegment[]>(() => {
    if (!scopedFloorStats.length) return []
    const segments: ChartSegment[] = [
      { label: '사용 가능', value: floorAggregate.available, color: statusColors.AVAILABLE },
      { label: '사용 중', value: floorAggregate.used, color: statusColors.FULL },
      { label: '반납 지연', value: floorAggregate.overdue, color: statusColors.OVERDUE },
      { label: '고장/중지', value: floorAggregate.broken, color: statusColors.BROKEN },
      { label: '승인 대기', value: floorAggregate.pending, color: statusColors.PENDING },
    ]
    if (floorAggregate.disabled > 0) {
      segments.push({ label: '비활성', value: floorAggregate.disabled, color: statusColors.DISABLED })
    }
    return segments
  }, [floorAggregate, scopedFloorStats.length, statusColors])

  const weeklyData = useMemo<AdminWeeklyStatsPoint[]>(() => {
    const raw = weeklyQuery.data?.weeklyData
    return Array.isArray(raw) ? raw : []
  }, [weeklyQuery.data?.weeklyData])

  const coinWeeklyData = useMemo<AdminCoinStatsPoint[]>(() => {
    const raw = coinStatsQuery.data?.weeklyData
    return Array.isArray(raw) ? raw : []
  }, [coinStatsQuery.data?.weeklyData])

  const itemUsageStats = useMemo<AdminItemUsageStat[]>(() => {
    const raw = itemUsageQuery.data?.itemStats
    return Array.isArray(raw) ? raw : []
  }, [itemUsageQuery.data?.itemStats])

  const penaltyUsers = useMemo<AdminPenaltyUser[]>(() => {
    const raw = penaltyUsersQuery.data
    return Array.isArray(raw) ? raw : []
  }, [penaltyUsersQuery.data])

  const brokenCabinets = useMemo<AdminBrokenCabinet[]>(() => {
    const raw = brokenCabinetsQuery.data
    return Array.isArray(raw) ? raw : []
  }, [brokenCabinetsQuery.data])

  const adminSections = useMemo(() => getSectionsByFloor(adminFloor), [adminFloor])

  const cabinets = useMemo<Cabinet[]>(() => {
    const raw = cabinetsQuery.data
    return Array.isArray(raw) ? raw : []
  }, [cabinetsQuery.data])

  const filteredCabinets = useMemo(() => {
    return cabinets.filter((cabinet) => {
      const sectionId = extractSectionId(cabinet.section)
      if (selectedSectionIds.length > 0 && (!sectionId || !selectedSectionIds.includes(sectionId))) {
        return false
      }
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(cabinet.status)) {
        return false
      }
      return true
    })
  }, [cabinets, selectedSectionIds, selectedStatuses])

  const toggleCabinetSelection = (cabinetId: number) => {
    setSelectedCabinetIds((prev) =>
      prev.includes(cabinetId) ? prev.filter((id) => id !== cabinetId) : [...prev, cabinetId],
    )
  }

  const selectAllFiltered = () => {
    setSelectedCabinetIds(filteredCabinets.map((cabinet) => cabinet.cabinetId))
  }

  const clearSelection = () => setSelectedCabinetIds([])

  const handleBundleUpdate = () => {
    if (selectedCabinetIds.length === 0) return
    cabinetBundleMutation.mutate(
      {
        cabinetIds: selectedCabinetIds,
        status: bundleStatus,
        statusNote: bundleNote.trim() || undefined,
      },
      {
        onSuccess: () => {
          cabinetsQuery.refetch()
          brokenCabinetsQuery.refetch()
          pendingQuery.refetch()
          clearSelection()
        },
      },
    )
  }

  const storeCoinsSegments = useMemo<ChartSegment[]>(() => {
    if (!storeQuery.data) return []
    const held = Number(storeQuery.data.totalUserCoins ?? 0)
    const used = Number(storeQuery.data.totalUsedCoins ?? 0)
    return [
      { label: '보유', value: held, color: statusColors.FULL },
      { label: '사용', value: used, color: statusColors.AVAILABLE },
    ]
  }, [storeQuery.data, statusColors])

  const penaltyRows = penaltyUsers.map((user) => [
    user.name,
    `${user.penaltyDays}일`,
    new Date(user.penaltyEndDate).toLocaleString(),
  ])

  const brokenRows = brokenCabinets.map((cabinet) => [
    `#${cabinet.visibleNum}`,
    `${cabinet.floor}F`,
    cabinet.section,
    cabinet.statusNote ?? '-',
  ])

  const overdueRows = (overdueQuery.data ?? []).map((item) => [
    item.name,
    `#${item.visibleNum}`,
    `${item.overdueDays}일`,
  ])

  return (
    <Stack spacing={10}>
      <PageHeader
        title="SUBAK 관리자 콘솔"
        description="사물함과 사용자 상태를 한눈에 파악하고 즉시 조치할 수 있는 관리자 대시보드입니다."
      />

      <Tabs variant="enclosed" colorScheme="brand" isLazy>
        <TabList flexWrap="wrap" gap={2}>
          <Tab>대시보드</Tab>
          <Tab>재화 관리</Tab>
          <Tab>사용자 관리</Tab>
          <Tab>사물함 관리</Tab>
          <Tab>설정</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Stack spacing={8}>
              <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  핵심 지표 요약
                </Text>
                {statsQuery.isLoading ? (
                  <LoadingState label="관리자 통계를 불러오는 중입니다." />
                ) : statsQuery.isError ? (
                  <ErrorState onRetry={statsQuery.refetch} />
                ) : !dashboardCards.length ? (
                  <EmptyState title="표시할 통계가 없습니다" description="잠시 후 다시 시도해 주세요." />
                ) : (
                  <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                    {dashboardCards.map((card) => (
                      <Box key={card.label} borderWidth={1} borderRadius="lg" p={4}>
                        <Text fontSize="sm" color={mutedText}>
                          {card.label}
                        </Text>
                        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="black">
                          {card.value}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                {floorStatsQuery.isLoading ? (
                  <LoadingState label="층별 현황을 불러오는 중입니다." />
                ) : floorStatsQuery.isError ? (
                  <ErrorState onRetry={floorStatsQuery.refetch} />
                ) : floorAggregateSegments.length ? (
                  <Stack spacing={4}>
                    <HStack spacing={2} justify="flex-end" flexWrap="wrap">
                      <Button
                        size="sm"
                        variant={floorStatsScope === 'all' ? 'solid' : 'outline'}
                        colorScheme="brand"
                        onClick={() => setFloorStatsScope('all')}
                      >
                        전체
                      </Button>
                      <Button
                        size="sm"
                        variant={floorStatsScope === 2 ? 'solid' : 'outline'}
                        colorScheme="brand"
                        onClick={() => setFloorStatsScope(2)}
                      >
                        2층
                      </Button>
                      <Button
                        size="sm"
                        variant={floorStatsScope === 3 ? 'solid' : 'outline'}
                        colorScheme="brand"
                        onClick={() => setFloorStatsScope(3)}
                      >
                        3층
                      </Button>
                    </HStack>
                    <DonutChart
                      title="층별 사물함 이용 현황"
                      segments={floorAggregateSegments}
                      centerLabel={formatNumber(floorAggregate.total)}
                      centerSubLabel={
                        floorStatsScope === 'all'
                          ? '전체 사물함'
                          : `${floorStatsScope}층 사물함`
                      }
                    />
                  </Stack>
                ) : (
                  <EmptyState title="층별 현황 데이터가 없습니다" />
                )}

                {weeklyQuery.isLoading ? (
                  <LoadingState label="주간 이용 현황을 불러오는 중입니다." />
                ) : weeklyQuery.isError ? (
                  <ErrorState onRetry={weeklyQuery.refetch} />
                ) : weeklyData.length ? (
                  <LineChart
                    title="4주간 주간 이용 현황"
                    firstSeries={weeklyData}
                    secondSeries={weeklyData}
                    firstLabel="대여 시작"
                    secondLabel="반납 완료"
                  />
                ) : (
                  <EmptyState title="주간 이용 현황 데이터가 없습니다" />
                )}
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                {penaltyUsersQuery.isLoading ? (
                  <LoadingState label="패널티 유저를 불러오는 중입니다." />
                ) : penaltyUsersQuery.isError ? (
                  <ErrorState onRetry={penaltyUsersQuery.refetch} />
                ) : (
                  <InfoTable
                    title="사용정지 유저"
                    columns={["Intra ID", '패널티 일수', '종료 시점']}
                    rows={penaltyRows}
                    emptyTitle="패널티 유저가 없습니다"
                  />
                )}

                {brokenCabinetsQuery.isLoading ? (
                  <LoadingState label="고장 사물함을 불러오는 중입니다." />
                ) : brokenCabinetsQuery.isError ? (
                  <ErrorState onRetry={brokenCabinetsQuery.refetch} />
                ) : (
                  <InfoTable
                    title="고장 사물함"
                    columns={["사물함", '층', '섹션', '메모']}
                    rows={brokenRows}
                    emptyTitle="고장 사물함이 없습니다"
                  />
                )}
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                <Box borderWidth={1} borderRadius="xl" p={5} bg={highlightBg} borderColor={highlightBorder}>
                  <Text fontWeight="bold" mb={3}>
                    연체자 목록
                  </Text>
                  {overdueQuery.isLoading ? (
                    <LoadingState label="연체자를 불러오는 중입니다." />
                  ) : overdueQuery.isError ? (
                    <ErrorState onRetry={overdueQuery.refetch} />
                  ) : overdueQuery.data?.length ? (
                    <Stack spacing={3}>
                      {overdueQuery.data.map((item) => (
                        <Box key={`${item.userId}-${item.visibleNum}`} borderWidth={1} borderRadius="lg" p={3}>
                          <Text fontWeight="semibold">
                            {item.name} · #{item.visibleNum}
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            연체 {item.overdueDays}일
                          </Text>
                          <Button
                            mt={2}
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            isLoading={forceReturnMutation.isPending}
                            onClick={() => forceReturnMutation.mutate(item.visibleNum)}
                          >
                            강제 반납
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <EmptyState title="연체자가 없습니다" />
                  )}
                </Box>

                <Box borderWidth={1} borderRadius="xl" p={5} bg={highlightBg} borderColor={highlightBorder}>
                  <Text fontWeight="bold" mb={3}>
                    반납 승인 대기
                  </Text>
                  {pendingQuery.isLoading ? (
                    <LoadingState label="승인 대기 목록을 불러오는 중입니다." />
                  ) : pendingQuery.isError ? (
                    <ErrorState onRetry={pendingQuery.refetch} />
                  ) : pendingQuery.data?.length ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      {pendingQuery.data.map((item) => (
                        <Box key={item.visibleNum} borderWidth={1} borderRadius="lg" p={3}>
                          <Text fontWeight="semibold">#{item.visibleNum}</Text>
                          {item.intraId && (
                            <Text fontSize="sm" color={mutedText}>
                              {item.intraId}
                            </Text>
                          )}
                          <Text fontSize="sm" color={mutedText}>
                            {item.statusNote ?? '사유 없음'}
                          </Text>
                          {item.photoUrl && (
                            <Box mt={3} borderWidth={1} borderColor={highlightBorder} borderRadius="md" overflow="hidden">
                              <Image src={item.photoUrl} alt={`사물함 ${item.visibleNum} 사진`} w="full" />
                            </Box>
                          )}
                          <Button
                            mt={2}
                            size="sm"
                            colorScheme="brand"
                            variant="outline"
                            isLoading={approvePendingMutation.isPending}
                            onClick={() =>
                              approvePendingMutation.mutate(item.visibleNum, {
                                onSuccess: () => pendingQuery.refetch(),
                              })
                            }
                          >
                            승인 처리
                          </Button>
                        </Box>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <EmptyState title="승인 대기 항목이 없습니다" />
                  )}
                </Box>
              </SimpleGrid>
            </Stack>
          </TabPanel>

          <TabPanel px={0}>
            <Stack spacing={8}>
              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                {coinStatsQuery.isLoading ? (
                  <LoadingState label="재화 흐름을 불러오는 중입니다." />
                ) : coinStatsQuery.isError ? (
                  <ErrorState onRetry={coinStatsQuery.refetch} />
                ) : coinWeeklyData.length ? (
                  <LineChart
                    title="주간 재화 흐름 (4주)"
                    firstSeries={coinWeeklyData}
                    secondSeries={coinWeeklyData}
                    firstLabel="지급 코인"
                    secondLabel="사용/회수 코인"
                  />
                ) : (
                  <EmptyState title="재화 흐름 데이터가 없습니다" />
                )}

                {storeQuery.isLoading ? (
                  <LoadingState label="전체 재화 현황을 불러오는 중입니다." />
                ) : storeQuery.isError ? (
                  <ErrorState onRetry={storeQuery.refetch} />
                ) : storeCoinsSegments.length ? (
                  <DonutChart
                    title="전체 재화 현황"
                    segments={storeCoinsSegments}
                    centerLabel={formatNumber(
                      storeCoinsSegments.reduce((sum, segment) => sum + segment.value, 0),
                    )}
                    centerSubLabel="총 코인"
                  />
                ) : (
                  <EmptyState title="재화 현황 데이터가 없습니다" />
                )}
              </SimpleGrid>

              <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  아이템 사용 통계
                </Text>
                {itemUsageQuery.isLoading ? (
                  <LoadingState label="아이템 통계를 불러오는 중입니다." />
                ) : itemUsageQuery.isError ? (
                  <ErrorState onRetry={itemUsageQuery.refetch} />
                ) : itemUsageStats.length ? (
                  <Stack spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box borderWidth={1} borderRadius="lg" p={4}>
                        <Text fontSize="sm" color={mutedText}>
                          출석 보상 지급 횟수
                        </Text>
                        <Text fontSize="3xl" fontWeight="black">
                          {formatNumber(itemUsageQuery.data?.attendanceRewardsCount)}
                        </Text>
                      </Box>
                      <Box borderWidth={1} borderRadius="lg" p={4}>
                        <Text fontSize="sm" color={mutedText}>
                          수박씨 보상 지급 횟수
                        </Text>
                        <Text fontSize="3xl" fontWeight="black">
                          {formatNumber(itemUsageQuery.data?.watermelonRewardsCount)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                    <Box overflowX="auto">
                      <Box minW="640px">
                        <SimpleGrid columns={4} bg={itemHeaderBg} color="white" px={4} py={3}>
                          <Text fontWeight="bold" fontSize="sm">
                            아이템
                          </Text>
                          <Text fontWeight="bold" fontSize="sm">
                            타입
                          </Text>
                          <Text fontWeight="bold" fontSize="sm">
                            구매 수
                          </Text>
                          <Text fontWeight="bold" fontSize="sm">
                            사용 수
                          </Text>
                        </SimpleGrid>
                        <Stack spacing={0}>
                          {itemUsageStats.map((item) => (
                            <SimpleGrid
                              key={`${item.itemType}-${item.itemName}`}
                              columns={4}
                              px={4}
                              py={3}
                              borderBottomWidth={1}
                              borderColor={highlightBorder}
                            >
                              <Text fontWeight="semibold">{item.itemName}</Text>
                              <Text color={mutedText}>{item.itemType}</Text>
                              <Text>{formatNumber(item.purchaseCount)}</Text>
                              <Text>{formatNumber(item.usedCount)}</Text>
                            </SimpleGrid>
                          ))}
                        </Stack>
                      </Box>
                    </Box>
                  </Stack>
                ) : (
                  <EmptyState title="아이템 통계가 없습니다" />
                )}
              </Box>

              <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
                <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                  <Stack spacing={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      아이템 가격 관리
                    </Text>
                    <FormControl>
                      <FormLabel>아이템 선택</FormLabel>
                      <Select value={priceItemName} onChange={(event) => setPriceItemName(event.target.value)}>
                        {priceItemOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>가격 (수박씨)</FormLabel>
                      <NumberInput value={priceValue} min={0} onChange={(value) => setPriceValue(value)}>
                        <NumberInputField placeholder="예: 1000" />
                      </NumberInput>
                    </FormControl>
                    <Button
                      colorScheme="brand"
                      isLoading={itemPriceMutation.isPending}
                      onClick={() =>
                        itemPriceMutation.mutate({
                          itemName: priceItemName,
                          payload: { price: Number(priceValue) },
                        })
                      }
                    >
                      가격 변경
                    </Button>
                  </Stack>
                </Box>

                <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                  <Stack spacing={4}>
                    <Text fontSize="lg" fontWeight="bold">
                      긴급 공지 발송
                    </Text>
                    <FormControl>
                      <FormLabel>공지 메시지</FormLabel>
                      <Textarea
                        minH="140px"
                        value={emergencyMessage}
                        onChange={(event) => setEmergencyMessage(event.target.value)}
                      />
                    </FormControl>
                    <Button
                      colorScheme="red"
                      isLoading={emergencyNoticeMutation.isPending}
                      onClick={() => emergencyNoticeMutation.mutate({ message: emergencyMessage })}
                    >
                      긴급 공지 발송
                    </Button>
                  </Stack>
                </Box>
              </SimpleGrid>
            </Stack>
          </TabPanel>

          <TabPanel px={0}>
            <Stack spacing={6}>
              <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
                <InfoTable
                  title="패널티 유저 목록"
                  columns={["Intra ID", '패널티 일수', '종료 시점']}
                  rows={penaltyRows}
                  emptyTitle="패널티 유저가 없습니다"
                />
                <InfoTable
                  title="연체 유저 목록"
                  columns={["Intra ID", '사물함', '연체 기간']}
                  rows={overdueRows}
                  emptyTitle="연체 유저가 없습니다"
                />
                <InfoTable
                  title="고장 사물함 목록"
                  columns={["사물함", '층', '섹션', '메모']}
                  rows={brokenRows}
                  emptyTitle="고장 사물함이 없습니다"
                />
              </SimpleGrid>

              <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                <Stack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold">
                    사용자 상세 관리
                  </Text>
                  <form onSubmit={handleUserSearch}>
                    <FormControl>
                      <FormLabel>인트라 ID로 검색</FormLabel>
                      <HStack spacing={3}>
                        <Input
                          placeholder="예: seonghan"
                          value={nameInput}
                          onChange={(event) => setNameInput(event.target.value)}
                        />
                        <Button type="submit" colorScheme="brand" isLoading={userQuery.isFetching}>
                          조회
                        </Button>
                      </HStack>
                    </FormControl>
                  </form>

                  {userQuery.isError && (
                    <ErrorState onRetry={userQuery.refetch} description="사용자 정보를 찾을 수 없습니다." />
                  )}

                  {!searchedName ? (
                    <EmptyState
                      title="검색이 필요합니다"
                      description="인트라 ID를 입력하고 조회 버튼을 눌러 주세요."
                    />
                  ) : userQuery.isLoading ? (
                    <LoadingState label="사용자 정보를 불러오는 중입니다." />
                  ) : userData ? (
                    <Stack spacing={4} borderWidth={1} borderRadius="lg" p={4}>
                      <Stack spacing={1}>
                        <Text fontSize="xl" fontWeight="bold">
                          {userData.name}
                        </Text>
                        <Text color={mutedText}>{userData.email}</Text>
                      </Stack>
                      <HStack spacing={3} flexWrap="wrap">
                        <Button
                          size="sm"
                          colorScheme="brand"
                          variant="outline"
                          isLoading={adminPromoteMutation.isPending}
                          onClick={() =>
                            adminPromoteMutation.mutate(userData.name, {
                              onSuccess: () => userQuery.refetch(),
                            })
                          }
                        >
                          관리자 권한 부여
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="gray"
                          variant="outline"
                          isLoading={adminDemoteMutation.isPending}
                          onClick={() =>
                            adminDemoteMutation.mutate(userData.name, {
                              onSuccess: () => userQuery.refetch(),
                            })
                          }
                        >
                          관리자 권한 해제
                        </Button>
                      </HStack>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Box borderWidth={1} borderRadius="lg" p={4}>
                          <Text fontSize="sm" color={mutedText}>
                            코인
                          </Text>
                          <Text fontSize="2xl" fontWeight="black">
                            {formatNumber(userData.coin)}
                          </Text>
                        </Box>
                        <Box borderWidth={1} borderRadius="lg" p={4}>
                          <Text fontSize="sm" color={mutedText}>
                            패널티 일수
                          </Text>
                          <Text fontSize="2xl" fontWeight="black">
                            {formatNumber(userData.penaltyDays)}
                          </Text>
                        </Box>
                        <Box borderWidth={1} borderRadius="lg" p={4}>
                          <Text fontSize="sm" color={mutedText}>
                            이번 달 학습 시간 (분)
                          </Text>
                          <Text fontSize="2xl" fontWeight="black">
                            {formatNumber(userData.monthlyLogtime)}
                          </Text>
                        </Box>
                      </SimpleGrid>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box borderWidth={1} borderRadius="lg" p={4}>
                          <Text fontSize="sm" color={mutedText}>
                            현재 사물함
                          </Text>
                          <Text fontSize="xl" fontWeight="bold">
                            {userData.currentCabinetNum ? `#${userData.currentCabinetNum}` : '없음'}
                          </Text>
                        </Box>
                        <Box borderWidth={1} borderRadius="lg" p={4}>
                          <Text fontSize="sm" color={mutedText} mb={2}>
                            보유 아이템 수량
                          </Text>
                          {userData.itemCounts && Object.keys(userData.itemCounts).length > 0 ? (
                            <Wrap spacing={2}>
                              {Object.entries(userData.itemCounts).map(([itemType, count]) => (
                                <WrapItem key={itemType}>
                                  <Badge colorScheme="brand" variant="subtle" px={3} py={1} borderRadius="full">
                                    {itemType}: {formatNumber(count)}
                                  </Badge>
                                </WrapItem>
                              ))}
                            </Wrap>
                          ) : (
                            <Text color={mutedText}>아이템 정보가 없습니다.</Text>
                          )}
                        </Box>
                      </SimpleGrid>

                      <Divider />

                      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={4}>
                        <FormControl>
                          <FormLabel>코인 지급 / 회수</FormLabel>
                          <Stack spacing={2}>
                            <NumberInput value={coinAmount} min={1} onChange={(value) => setCoinAmount(value)}>
                              <NumberInputField placeholder="수량" />
                            </NumberInput>
                            <Textarea
                              placeholder="지급 사유"
                              value={coinReason}
                              onChange={(event) => setCoinReason(event.target.value)}
                            />
                            <Button
                              colorScheme="green"
                              isLoading={coinMutation.isPending}
                              onClick={() =>
                                coinMutation.mutate(
                                  {
                                    name: userData.name,
                                    payload: { amount: Number(coinAmount), reason: coinReason },
                                  },
                                  { onSuccess: () => userQuery.refetch() },
                                )
                              }
                            >
                              코인 지급
                            </Button>
                            <Textarea
                              placeholder="회수 사유"
                              value={coinRevokeReason}
                              onChange={(event) => setCoinRevokeReason(event.target.value)}
                            />
                            <Button
                              colorScheme="red"
                              variant="outline"
                              isLoading={coinRevokeMutation.isPending}
                              onClick={() =>
                                coinRevokeMutation.mutate(
                                  {
                                    name: userData.name,
                                    payload: {
                                      amount: Number(coinAmount),
                                      reason: coinRevokeReason,
                                    },
                                  },
                                  { onSuccess: () => userQuery.refetch() },
                                )
                              }
                            >
                              코인 회수
                            </Button>
                          </Stack>
                        </FormControl>

                        <FormControl>
                          <FormLabel>학습 시간 / 패널티</FormLabel>
                          <Stack spacing={2}>
                            <NumberInput value={logtimeValue} min={0} onChange={(value) => setLogtimeValue(value)}>
                              <NumberInputField placeholder="학습 시간(분)" />
                            </NumberInput>
                            <Button
                              variant="outline"
                              colorScheme="brand"
                              isLoading={logtimeMutation.isPending}
                              onClick={() =>
                                logtimeMutation.mutate(
                                  {
                                    name: userData.name,
                                    payload: { monthlyLogtime: Number(logtimeValue) },
                                  },
                                  { onSuccess: () => userQuery.refetch() },
                                )
                              }
                            >
                              학습 시간 수정
                            </Button>
                            <NumberInput value={penaltyDays} min={1} onChange={(value) => setPenaltyDays(value)}>
                              <NumberInputField placeholder="패널티 일수" />
                            </NumberInput>
                            <Textarea
                              placeholder="부여 사유"
                              value={penaltyReason}
                              onChange={(event) => setPenaltyReason(event.target.value)}
                            />
                            <HStack spacing={2}>
                              <Button
                                colorScheme="red"
                                isLoading={penaltyAssignMutation.isPending}
                                onClick={() =>
                                  penaltyAssignMutation.mutate(
                                    {
                                      name: userData.name,
                                      payload: { penaltyDays: Number(penaltyDays), reason: penaltyReason },
                                    },
                                    { onSuccess: () => userQuery.refetch() },
                                  )
                                }
                              >
                                패널티 부여
                              </Button>
                              <Button
                                variant="outline"
                                colorScheme="gray"
                                isLoading={penaltyRemoveMutation.isPending}
                                onClick={() =>
                                  penaltyRemoveMutation.mutate(userData.name, {
                                    onSuccess: () => userQuery.refetch(),
                                  })
                                }
                              >
                                패널티 해제
                              </Button>
                            </HStack>
                          </Stack>
                        </FormControl>

                        <FormControl>
                          <FormLabel>아이템 지급 / 회수</FormLabel>
                          <Stack spacing={2}>
                            <Select value={itemName} onChange={(event) => setItemName(event.target.value)}>
                              {itemGrantOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                            <Textarea
                              placeholder="지급 사유"
                              value={itemReason}
                              onChange={(event) => setItemReason(event.target.value)}
                            />
                            <Button
                              colorScheme="brand"
                              isLoading={itemGrantMutation.isPending}
                              onClick={() =>
                                itemGrantMutation.mutate(
                                  {
                                    name: userData.name,
                                    payload: { itemName, reason: itemReason },
                                  },
                                  { onSuccess: () => userQuery.refetch() },
                                )
                              }
                            >
                              아이템 지급
                            </Button>

                            <Divider />

                            <Select value={itemRevokeName} onChange={(event) => setItemRevokeName(event.target.value)}>
                              {itemGrantOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                            <NumberInput
                              value={itemRevokeAmount}
                              min={1}
                              onChange={(value) => setItemRevokeAmount(value)}
                            >
                              <NumberInputField placeholder="회수 수량" />
                            </NumberInput>
                            <Button
                              colorScheme="red"
                              variant="outline"
                              isLoading={itemRevokeMutation.isPending}
                              onClick={() =>
                                itemRevokeMutation.mutate(
                                  {
                                    name: userData.name,
                                    payload: {
                                      itemName: itemRevokeName,
                                      amount: Number(itemRevokeAmount),
                                    },
                                  },
                                  { onSuccess: () => userQuery.refetch() },
                                )
                              }
                            >
                              아이템 회수
                            </Button>
                          </Stack>
                        </FormControl>
                      </SimpleGrid>
                    </Stack>
                  ) : null}
                </Stack>
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel px={0}>
            <Stack spacing={6}>
              <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                <Stack spacing={4}>
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <Text fontSize="lg" fontWeight="bold">
                      사물함 맵 관리 (다중 선택 지원)
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        variant={adminFloor === 2 ? 'solid' : 'outline'}
                        colorScheme="brand"
                        onClick={() => {
                          setAdminFloor(2)
                          clearSelection()
                        }}
                      >
                        2F
                      </Button>
                      <Button
                        size="sm"
                        variant={adminFloor === 3 ? 'solid' : 'outline'}
                        colorScheme="brand"
                        onClick={() => {
                          setAdminFloor(3)
                          clearSelection()
                        }}
                      >
                        3F
                      </Button>
                    </HStack>
                  </HStack>

                  <Stack spacing={2}>
                    <Text fontWeight="semibold">섹션 필터</Text>
                    <Wrap spacing={2}>
                      {adminSections.map((section) => (
                        <WrapItem key={section.id}>
                          <Button
                            size="sm"
                            variant={selectedSectionIds.includes(section.id) ? 'solid' : 'outline'}
                            colorScheme="brand"
                            onClick={() =>
                              setSelectedSectionIds((prev) =>
                                prev.includes(section.id)
                                  ? prev.filter((id) => id !== section.id)
                                  : [...prev, section.id],
                              )
                            }
                          >
                            {section.title}
                          </Button>
                        </WrapItem>
                      ))}
                      <WrapItem>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedSectionIds([])}>
                          섹션 초기화
                        </Button>
                      </WrapItem>
                    </Wrap>
                  </Stack>

                  <Stack spacing={2}>
                    <Text fontWeight="semibold">상태 필터</Text>
                    <Wrap spacing={2}>
                      {cabinetStatusOptions.map((status) => (
                        <WrapItem key={status}>
                          <Button
                            size="sm"
                            variant={selectedStatuses.includes(status) ? 'solid' : 'outline'}
                            colorScheme="brand"
                            onClick={() =>
                              setSelectedStatuses((prev) =>
                                prev.includes(status)
                                  ? prev.filter((value) => value !== status)
                                  : [...prev, status],
                              )
                            }
                          >
                            {statusLabels[status]}
                          </Button>
                        </WrapItem>
                      ))}
                      <WrapItem>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedStatuses([])}>
                          상태 초기화
                        </Button>
                      </WrapItem>
                    </Wrap>
                  </Stack>

                  <HStack spacing={3} flexWrap="wrap">
                    <Button size="sm" onClick={selectAllFiltered} isDisabled={filteredCabinets.length === 0}>
                      필터된 전체 선택
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearSelection}>
                      선택 해제
                    </Button>
                    <Badge colorScheme="brand" variant="subtle" px={3} py={1} borderRadius="full">
                      선택: {selectedCabinetIds.length}개 / 표시: {filteredCabinets.length}개
                    </Badge>
                  </HStack>

                  {cabinetsQuery.isLoading ? (
                    <LoadingState label="사물함 목록을 불러오는 중입니다." />
                  ) : cabinetsQuery.isError ? (
                    <ErrorState onRetry={cabinetsQuery.refetch} />
                  ) : filteredCabinets.length === 0 ? (
                    <EmptyState title="필터 조건에 맞는 사물함이 없습니다" />
                  ) : (
                    <SimpleGrid columns={{ base: 3, sm: 4, md: 6, xl: 8 }} spacing={3}>
                      {filteredCabinets.map((cabinet) => {
                        const isSelected = selectedCabinetIds.includes(cabinet.cabinetId)
                        const tileBg = tileBgByStatus[cabinet.status] ?? tileBgDisabled
                        return (
                          <Box
                            key={cabinet.cabinetId}
                            borderWidth={2}
                            borderColor={isSelected ? tileSelectedBorder : tileDefaultBorder}
                            borderRadius="xl"
                            bg={tileBg}
                            color="white"
                            minH="96px"
                            p={3}
                            cursor="pointer"
                            onClick={() => toggleCabinetSelection(cabinet.cabinetId)}
                            shadow={isSelected ? 'lg' : 'sm'}
                            transition="all 0.15s ease"
                          >
                            <Stack spacing={1}>
                              <Text fontWeight="black" fontSize="lg">
                                {cabinet.visibleNum}
                              </Text>
                              <Text fontSize="xs" opacity={0.9}>
                                {statusLabels[cabinet.status]}
                              </Text>
                              {cabinet.lentUserName && (
                                <Text fontSize="xs" noOfLines={1}>
                                  {cabinet.lentUserName}
                                </Text>
                              )}
                            </Stack>
                          </Box>
                        )
                      })}
                    </SimpleGrid>
                  )}

                  <Divider />

                  <Stack spacing={3}>
                    <Text fontWeight="bold">선택한 사물함 상태 일괄 변경</Text>
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                      <FormControl>
                        <FormLabel>변경할 상태</FormLabel>
                        <Select
                          value={bundleStatus}
                          onChange={(event) => setBundleStatus(event.target.value as CabinetStatusValue)}
                        >
                          {cabinetStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status]}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl gridColumn={{ base: 'auto', md: 'span 2' }}>
                        <FormLabel>상태 메모</FormLabel>
                        <Input
                          placeholder="예: 문짝 파손"
                          value={bundleNote}
                          onChange={(event) => setBundleNote(event.target.value)}
                        />
                      </FormControl>
                    </SimpleGrid>
                    <Button
                      colorScheme="brand"
                      isLoading={cabinetBundleMutation.isPending}
                      isDisabled={selectedCabinetIds.length === 0}
                      onClick={handleBundleUpdate}
                      alignSelf="flex-start"
                    >
                      선택한 {selectedCabinetIds.length}개 상태 변경
                    </Button>
                  </Stack>
                </Stack>
              </Box>

              <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                <Stack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold">
                    단일 사물함 상세 관리
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <FormControl>
                      <FormLabel>사물함 번호</FormLabel>
                      <NumberInput value={cabinetNumInput} min={1} onChange={(value) => setCabinetNumInput(value)}>
                        <NumberInputField placeholder="예: 1001" />
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>사물함 상태</FormLabel>
                      <Select
                        value={cabinetStatus}
                        onChange={(event) => setCabinetStatus(event.target.value as CabinetStatusValue)}
                      >
                        {cabinetStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>대여 타입</FormLabel>
                      <Select
                        value={cabinetLentType}
                        onChange={(event) => setCabinetLentType(event.target.value as CabinetLentType)}
                      >
                        {cabinetLentTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                  <FormControl>
                    <FormLabel>상태 메모</FormLabel>
                    <Textarea
                      placeholder="예: 문짝 파손으로 사용 중지"
                      value={cabinetNote}
                      onChange={(event) => setCabinetNote(event.target.value)}
                    />
                  </FormControl>
                  <HStack spacing={3} flexWrap="wrap">
                    <Button
                      colorScheme="brand"
                      isLoading={cabinetStatusMutation.isPending}
                      isDisabled={!isCabinetNumberValid}
                      onClick={() =>
                        cabinetStatusMutation.mutate({
                          visibleNum: cabinetNumber,
                          payload: {
                            status: cabinetStatus,
                            lentType: cabinetLentType,
                            statusNote: cabinetNote,
                          },
                        })
                      }
                    >
                      상태 변경
                    </Button>
                    <Button
                      variant="outline"
                      colorScheme="red"
                      isLoading={forceReturnMutation.isPending}
                      isDisabled={!isCabinetNumberValid}
                      onClick={() => forceReturnMutation.mutate(cabinetNumber)}
                    >
                      강제 반납
                    </Button>
                  </HStack>

                  <Divider />

                  {cabinetDetailQuery.isLoading ? (
                    <LoadingState label="사물함 정보를 불러오는 중입니다." />
                  ) : cabinetDetailQuery.isError ? (
                    <ErrorState onRetry={cabinetDetailQuery.refetch} />
                  ) : cabinetDetailQuery.data ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box borderWidth={1} borderRadius="lg" p={4}>
                        <Text fontSize="sm" color={mutedText}>
                          상태
                        </Text>
                        <Text fontSize="xl" fontWeight="bold">
                          {cabinetDetailQuery.data.status}
                        </Text>
                      </Box>
                      <Box borderWidth={1} borderRadius="lg" p={4}>
                        <Text fontSize="sm" color={mutedText}>
                          현재 사용자
                        </Text>
                        <Text fontSize="xl" fontWeight="bold">
                          {cabinetDetailQuery.data.currentUserName ?? '없음'}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  ) : (
                    <EmptyState title="사물함 번호를 입력하고 정보를 확인해 주세요." />
                  )}

                  <Divider />

                  <Stack spacing={3}>
                    <Text fontWeight="bold">대여 기록</Text>
                    {cabinetHistoryQuery.isLoading ? (
                      <LoadingState label="대여 기록을 불러오는 중입니다." />
                    ) : cabinetHistoryQuery.isError ? (
                      <ErrorState onRetry={cabinetHistoryQuery.refetch} />
                    ) : cabinetHistoryQuery.data?.content?.length ? (
                      <Stack spacing={2}>
                        {cabinetHistoryQuery.data.content.map((history) => (
                          <Box key={history.lentHistoryId} borderWidth={1} borderRadius="lg" p={3}>
                            <Text fontWeight="semibold">{history.userName}</Text>
                            <Text fontSize="sm" color={mutedText}>
                              시작: {new Date(history.startedAt).toLocaleString()}
                            </Text>
                            <Text fontSize="sm" color={mutedText}>
                              종료:{' '}
                              {history.endedAt ? new Date(history.endedAt).toLocaleString() : '진행 중'}
                            </Text>
                          </Box>
                        ))}
                        <HStack spacing={3}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setHistoryPage((prev) => Math.max(prev - 1, 0))}
                            isDisabled={historyPage === 0}
                          >
                            이전
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setHistoryPage((prev) => prev + 1)}
                            isDisabled={
                              historyPage + 1 >= (cabinetHistoryQuery.data?.totalPages ?? historyPage + 1)
                            }
                          >
                            다음
                          </Button>
                        </HStack>
                      </Stack>
                    ) : (
                      <EmptyState title="대여 기록이 없습니다." />
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </TabPanel>

          <TabPanel px={0}>
            <EmptyState title="설정 탭은 재화 관리로 이동했습니다" description="아이템 가격과 긴급 공지는 재화 관리 탭에서 관리합니다." />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  )
}
