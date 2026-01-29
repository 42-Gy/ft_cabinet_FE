import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import {
  useCabinetDetailQuery,
  useCabinetsQuery,
  useCabinetSummaryQuery,
  useCheckReturnImageMutation,
  useRentCabinetMutation,
  useReserveCabinetMutation,
  useSwapCabinetMutation,
} from '@/features/lockers/hooks/useLockerData'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'
import { FloorSectionMap } from '@/features/lockers/components/FloorSectionMap'
import { extractSectionId, getSectionsByFloor, lockerFloors } from '@/features/lockers/data/cabinetSections'
import type { Cabinet, CabinetStatus, LockerSectionMeta } from '@/types/locker'

type LockerCardPalette = {
  bg: string
  border: string
  color: string
  muted: string
  borderWidth?: number
}

const statusBadgeMeta: Record<
  CabinetStatus,
  { color: string; label: string; description?: string }
> = {
  AVAILABLE: { color: 'green', label: '대여 가능', description: '바로 사용할 수 있어요.' },
  FULL: { color: 'orange', label: '사용 중', description: '다른 이용자가 사용 중입니다.' },
  BROKEN: { color: 'red', label: '점검 중', description: '점검 후 다시 열립니다.' },
  OVERDUE: { color: 'purple', label: '연체', description: '연체 상태입니다.' },
  DISABLED: { color: 'gray', label: '비활성', description: '현재 대여가 중지되었습니다.' },
  PENDING: { color: 'yellow', label: '승인 대기', description: '반납 승인 대기 중입니다.' },
}

export const LockersPage = () => {
  const { data: me } = useMeQuery()
  const isLoggedIn = Boolean(me)
  const hasLocker = Boolean(me?.lentCabinetId)
  const swapTicketCount = me?.myItems?.filter((item) => item.itemType === 'SWAP').length ?? 0
  const hasSwapTicket = swapTicketCount > 0
  const [activeFloor, setActiveFloor] = useState<number | null>(lockerFloors[0] ?? null)
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'detail'>('map')
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null)
  const [detailCabinetId, setDetailCabinetId] = useState<number | null>(null)
  const [sectionPageIndex, setSectionPageIndex] = useState(0)
  const detailDrawer = useDisclosure()
  const swapModal = useDisclosure()
  const [swapStep, setSwapStep] = useState<'confirm' | 'return'>('confirm')
  const [swapTarget, setSwapTarget] = useState<Cabinet | null>(null)
  const [swapFile, setSwapFile] = useState<File | null>(null)
  const [swapPreviewUrl, setSwapPreviewUrl] = useState<string | null>(null)
  const [swapPassword, setSwapPassword] = useState('')
  const [swapForceReturn, setSwapForceReturn] = useState(false)
  const [swapReason, setSwapReason] = useState('')
  const [swapCheckPassed, setSwapCheckPassed] = useState(false)
  const [swapCheckFailures, setSwapCheckFailures] = useState(0)
  const [swapCheckError, setSwapCheckError] = useState<string | null>(null)
  const [swapCameraError, setSwapCameraError] = useState<string | null>(null)
  const [swapCameraActive, setSwapCameraActive] = useState(false)
  const [swapCameraReady, setSwapCameraReady] = useState(false)
  const [swapCameraStarting, setSwapCameraStarting] = useState(false)
  const swapVideoRef = useRef<HTMLVideoElement | null>(null)
  const swapStreamRef = useRef<MediaStream | null>(null)
  const swapCameraReadyRef = useRef(false)
  const swapCameraTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const detailQuery = useCabinetDetailQuery(detailDrawer.isOpen ? detailCabinetId : null)
  const rentMutation = useRentCabinetMutation()
  const reserveMutation = useReserveCabinetMutation()
  const swapMutation = useSwapCabinetMutation()
  const checkImageMutation = useCheckReturnImageMutation()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<number, CabinetStatus>>({})
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const cardBg = useColorModeValue('white', 'gray.800')
  const mutedText = useColorModeValue('gray.600', 'gray.400')
  const lockerBg = useColorModeValue('white', 'gray.700')
  const lockerBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const myLockerBg = useColorModeValue('brand.100', 'brand.600')
  const myLockerBorder = useColorModeValue('brand.300', 'brand.400')
  const myLockerText = useColorModeValue('brand.900', 'white')
  const myLockerMuted = useColorModeValue('brand.700', 'brand.100')

  const availablePalette: LockerCardPalette = {
    bg: useColorModeValue('green.50', 'green.900'),
    border: useColorModeValue('green.200', 'green.500'),
    color: useColorModeValue('green.900', 'green.100'),
    muted: useColorModeValue('green.700', 'green.200'),
  }
  const fullPalette: LockerCardPalette = {
    bg: useColorModeValue('orange.50', 'orange.900'),
    border: useColorModeValue('orange.200', 'orange.500'),
    color: useColorModeValue('orange.900', 'orange.100'),
    muted: useColorModeValue('orange.700', 'orange.200'),
  }
  const overduePalette: LockerCardPalette = {
    bg: useColorModeValue('red.50', 'red.900'),
    border: useColorModeValue('red.200', 'red.500'),
    color: useColorModeValue('red.900', 'red.100'),
    muted: useColorModeValue('red.700', 'red.200'),
  }
  const brokenPalette: LockerCardPalette = {
    bg: useColorModeValue('gray.100', 'gray.800'),
    border: useColorModeValue('gray.300', 'gray.600'),
    color: useColorModeValue('gray.700', 'gray.100'),
    muted: useColorModeValue('gray.600', 'gray.300'),
  }
  const selectedPalette: LockerCardPalette = {
    bg: useColorModeValue('blue.100', 'blue.800'),
    border: useColorModeValue('blue.400', 'blue.300'),
    color: useColorModeValue('blue.900', 'white'),
    muted: useColorModeValue('blue.700', 'blue.100'),
    borderWidth: 2,
  }
  const myLockerStyle: LockerCardPalette = {
    bg: myLockerBg,
    border: myLockerBorder,
    color: myLockerText,
    muted: myLockerMuted,
    borderWidth: 2,
  }
  const defaultCardStyle: LockerCardPalette = {
    bg: lockerBg,
    border: lockerBorder,
    color: useColorModeValue('gray.800', 'gray.100'),
    muted: mutedText,
  }

  const lockerStatusPalette: Record<CabinetStatus, LockerCardPalette> = {
    AVAILABLE: availablePalette,
    FULL: fullPalette,
    OVERDUE: overduePalette,
    BROKEN: brokenPalette,
    DISABLED: brokenPalette,
    PENDING: brokenPalette,
  }

  const legendAvailable = useColorModeValue('green.400', 'green.200')
  const legendInUse = useColorModeValue('red.400', 'red.200')
  const legendUnavailable = useColorModeValue('gray.500', 'gray.300')
  const legendSelected = useColorModeValue('blue.500', 'blue.200')
  const indicatorInactive = useColorModeValue('gray.300', 'whiteAlpha.400')

  const sectionsForFloor: LockerSectionMeta[] = useMemo(
    () => (activeFloor ? getSectionsByFloor(activeFloor) : []),
    [activeFloor],
  )

  useEffect(() => {
    if (!sectionsForFloor.length) {
      if (activeSectionId !== null) {
        setActiveSectionId(null)
      }
      setSectionPageIndex(0)
      return
    }
    if (activeSectionId && sectionsForFloor.some((section) => section.id === activeSectionId)) {
      return
    }
    if (activeSectionId !== null) {
      setActiveSectionId(null)
    }
    setSectionPageIndex(0)
  }, [sectionsForFloor, activeSectionId])

  const currentSection = useMemo(
    () => sectionsForFloor.find((section) => section.id === activeSectionId) ?? null,
    [sectionsForFloor, activeSectionId],
  )

  const cabinetsQuery = useCabinetsQuery({
    floor: activeFloor ?? undefined,
    enabled: Boolean(activeFloor !== null && viewMode === 'detail'),
  })
  const summaryQuery = useCabinetSummaryQuery({
    floor: activeFloor ?? undefined,
    enabled: Boolean(activeFloor !== null && viewMode === 'map'),
  })

  const cabinetsForSection = useMemo(() => {
    if (!currentSection || !Array.isArray(cabinetsQuery.data)) return []
    return cabinetsQuery.data
      .filter((cabinet) => extractSectionId(cabinet.section) === currentSection.id)
      .sort((a, b) => a.visibleNum - b.visibleNum)
  }, [currentSection, cabinetsQuery.data])

  useEffect(() => {
    setSectionPageIndex(0)
  }, [currentSection?.id])

  const chunkedCabinets = useMemo(() => chunkArray(cabinetsForSection, 20), [cabinetsForSection])

  const displayCabinets = chunkedCabinets[sectionPageIndex] ?? []

  const sectionStats = useMemo(() => {
    const stats: Record<number, { total: number; available: number }> = {}
    if (!Array.isArray(summaryQuery.data)) return stats
    summaryQuery.data.forEach((item) => {
      const id = extractSectionId(item.section)
      if (!id) return
      stats[id] = { total: item.total, available: item.availableCount }
    })
    return stats
  }, [summaryQuery.data])

  useEffect(() => {
    if (sectionPageIndex > chunkedCabinets.length - 1) {
      setSectionPageIndex(Math.max(0, chunkedCabinets.length - 1))
    }
  }, [chunkedCabinets, sectionPageIndex])

  useEffect(() => {
    if (!currentSection || !cabinetsForSection.length) {
      setSelectedCabinetId(null)
      return
    }
    const currentSelected = cabinetsForSection.find(
      (cabinet) => cabinet.cabinetId === selectedCabinetId,
    )
    if (!currentSelected) {
      const nextAvailable = cabinetsForSection.find((cabinet) => cabinet.status === 'AVAILABLE')
      setSelectedCabinetId(nextAvailable ? nextAvailable.cabinetId : cabinetsForSection[0]?.cabinetId ?? null)
    }
  }, [cabinetsForSection, currentSection, selectedCabinetId])

  useEffect(() => {
    if (!displayCabinets.length) return
    const inCurrentView = displayCabinets.some((cabinet) => cabinet.cabinetId === selectedCabinetId)
    if (!inCurrentView) {
      const nextAvailable =
        displayCabinets.find((cabinet) => cabinet.status === 'AVAILABLE') ?? displayCabinets[0]
      setSelectedCabinetId(nextAvailable?.cabinetId ?? null)
    }
  }, [displayCabinets, selectedCabinetId])

  useEffect(() => {
    if (!currentSection || viewMode !== 'detail') return
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [currentSection?.id, viewMode])

  useEffect(() => {
    return () => {
      if (swapPreviewUrl) URL.revokeObjectURL(swapPreviewUrl)
      swapStreamRef.current?.getTracks().forEach((track) => track.stop())
      swapStreamRef.current = null
      if (swapCameraTimeoutRef.current) {
        clearTimeout(swapCameraTimeoutRef.current)
        swapCameraTimeoutRef.current = null
      }
    }
  }, [swapPreviewUrl])

  useEffect(() => {
    const video = swapVideoRef.current
    const stream = swapStreamRef.current
    if (!video || !stream || !swapCameraActive) return

    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    requestAnimationFrame(() => {
      video.play().catch((error) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('[SwapCamera] video play failed', error)
        }
        setSwapCameraError('카메라 재생을 시작할 수 없습니다.')
      })
    })
  }, [swapCameraActive])

  useEffect(() => {
    if (swapModal.isOpen && swapStep === 'return') {
      handleSwapStartCamera()
      return
    }
    handleSwapStopCamera()
  }, [swapModal.isOpen, swapStep])

  const selectedCabinet =
    cabinetsForSection.find((cabinet) => cabinet.cabinetId === selectedCabinetId) ?? null

  const getEffectiveStatus = (cabinet: Cabinet) =>
    optimisticStatuses[cabinet.visibleNum] ?? cabinet.status

  useEffect(() => {
    if (!cabinetsForSection.length) return
    setOptimisticStatuses((prev) => {
      let changed = false
      const next = { ...prev }
      cabinetsForSection.forEach((cabinet) => {
        const override = prev[cabinet.visibleNum]
        if (override && override === cabinet.status) {
          delete next[cabinet.visibleNum]
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [cabinetsForSection])

  const effectiveSelectedStatus = selectedCabinet ? getEffectiveStatus(selectedCabinet) : null

  const canRentSelected = Boolean(
    selectedCabinet && isLoggedIn && !hasLocker && effectiveSelectedStatus === 'AVAILABLE',
  )
  const canSwapSelected = Boolean(
    selectedCabinet &&
      isLoggedIn &&
      hasLocker &&
      hasSwapTicket &&
      effectiveSelectedStatus === 'AVAILABLE' &&
      selectedCabinet.visibleNum !== me?.visibleNum,
  )
  const resolvedStatusMeta =
    statusBadgeMeta[
      (effectiveSelectedStatus ?? selectedCabinet?.status) as CabinetStatus
    ] ?? statusBadgeMeta.BROKEN

  const handleSectionSelect = (section: LockerSectionMeta) => {
    setActiveFloor(section.floor)
    setActiveSectionId(section.id)
    setViewMode('detail')
  }

  const handleLockerSelect = (cabinet: Cabinet) => {
    setSelectedCabinetId(cabinet.cabinetId)
    openDetailDrawer(cabinet)
  }

  const openDetailDrawer = (cabinet: Cabinet) => {
    setDetailCabinetId(cabinet.cabinetId)
    detailDrawer.onOpen()
  }

  const markCabinetRented = (visibleNum: number) => {
    setOptimisticStatuses((prev) => ({
      ...prev,
      [visibleNum]: 'FULL',
    }))
  }

  const handleRentSelectedCabinet = () => {
    if (!selectedCabinet || !canRentSelected) return
    rentMutation.mutate(selectedCabinet.visibleNum, {
      onSuccess: () => markCabinetRented(selectedCabinet.visibleNum),
    })
  }

  const handleSwapModalClose = () => {
    if (swapPreviewUrl) URL.revokeObjectURL(swapPreviewUrl)
    setSwapFile(null)
    setSwapPreviewUrl(null)
    setSwapPassword('')
    setSwapForceReturn(false)
    setSwapReason('')
    setSwapCheckPassed(false)
    setSwapCheckFailures(0)
    setSwapCheckError(null)
    setSwapCameraError(null)
    setSwapStep('confirm')
    setSwapTarget(null)
    handleSwapStopCamera()
    swapModal.onClose()
  }

  const handleSwapStart = () => {
    if (!selectedCabinet || !canSwapSelected) return
    setSwapTarget(selectedCabinet)
    setSwapStep('confirm')
    swapModal.onOpen()
  }

  const handleSwapReserve = () => {
    if (!swapTarget) return
    reserveMutation.mutate(swapTarget.visibleNum, {
      onSuccess: () => {
        setSwapStep('return')
      },
    })
  }

  const handleSwapSubmit = () => {
    if (!swapTarget || !swapFile || swapPassword.trim().length !== 4) return
    swapMutation.mutate(
      {
        newVisibleNum: swapTarget.visibleNum,
        file: swapFile,
        previousPassword: swapPassword.trim(),
        forceReturn: swapForceReturn || swapCheckFailures >= 2,
        reason:
          swapForceReturn || swapCheckFailures >= 2 ? swapReason.trim() || undefined : undefined,
      },
      {
        onSuccess: () => {
          handleSwapModalClose()
        },
      },
    )
  }

  const handleSwapCheckImage = () => {
    if (!swapFile) return
    setSwapCheckError(null)
    checkImageMutation.mutate(swapFile, {
      onSuccess: () => {
        setSwapCheckPassed(true)
        handleSwapStopCamera()
        setSwapStep('return')
      },
      onError: () => {
        setSwapCheckPassed(false)
        setSwapCheckFailures((prev) => {
          const next = prev + 1
          const remaining = Math.max(0, 2 - next)
          setSwapCheckError(`관리자 수동 반납 신청 버튼 활성화까지 ${remaining}회 남았습니다`)
          return next
        })
      },
    })
  }

  const handleSwapManualReturn = () => {
    setSwapForceReturn(true)
    handleSwapStopCamera()
    setSwapStep('return')
  }

  const handleSwapFileSelect = (file: File | null) => {
    setSwapFile(file)
    setSwapPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    setSwapCheckPassed(false)
    setSwapCheckError(null)
  }

  function handleSwapStopCamera() {
    swapStreamRef.current?.getTracks().forEach((track) => track.stop())
    swapStreamRef.current = null
    if (swapVideoRef.current) {
      swapVideoRef.current.srcObject = null
    }
    setSwapCameraActive(false)
    setSwapCameraReady(false)
    swapCameraReadyRef.current = false
    if (swapCameraTimeoutRef.current) {
      clearTimeout(swapCameraTimeoutRef.current)
      swapCameraTimeoutRef.current = null
    }
  }

  const isSwapStreamAlive = () => {
    const stream = swapStreamRef.current
    if (!stream) return false
    return stream.getTracks().some((track) => track.readyState === 'live')
  }

  async function handleSwapStartCamera() {
    if (swapCameraStarting) return
    if (swapCameraActive && isSwapStreamAlive()) return
    try {
      setSwapCameraError(null)
      setSwapCameraReady(false)
      setSwapCameraStarting(true)
      swapCameraReadyRef.current = false
      if (swapCameraTimeoutRef.current) {
        clearTimeout(swapCameraTimeoutRef.current)
        swapCameraTimeoutRef.current = null
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setSwapCameraError('이 브라우저에서는 카메라를 사용할 수 없습니다.')
        setSwapCameraStarting(false)
        return
      }
      swapStreamRef.current?.getTracks().forEach((track) => track.stop())
      swapStreamRef.current = null

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      swapStreamRef.current = stream
      setSwapCameraActive(true)
      swapCameraTimeoutRef.current = setTimeout(() => {
        const video = swapVideoRef.current
        const isReady =
          Boolean(video && video.readyState >= 2 && video.videoWidth && video.videoHeight) ||
          swapCameraReadyRef.current
        if (isReady) {
          setSwapCameraReady(true)
          return
        }
        setSwapCameraError('카메라 준비가 지연되고 있습니다. 다시 시도해 주세요.')
        setSwapCameraStarting(false)
      }, 3000)
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('[SwapCamera] getUserMedia failed', error)
      }
      setSwapCameraError('카메라 접근이 허용되지 않았습니다.')
      setSwapCameraActive(false)
    } finally {
      setSwapCameraStarting(false)
    }
  }

  const handleSwapCapture = () => {
    if (!swapVideoRef.current) return
    const video = swapVideoRef.current
    if (!video.videoWidth || !video.videoHeight) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `swap-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setSwapFile(file)
      setSwapPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
      setSwapCheckPassed(false)
      setSwapCheckError(null)
      handleSwapStopCamera()
    }, 'image/jpeg', 0.9)
  }

  const handleSwapRetake = async () => {
    setSwapFile(null)
    setSwapPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setSwapCheckPassed(false)
    setSwapCheckError(null)
    setSwapStep('return')
    handleSwapStopCamera()
    await handleSwapStartCamera()
  }

  const renderDetailDrawer = () => {
    if (!detailDrawer.isOpen) return null
    let body: ReactNode
    if (detailQuery.isLoading) {
      body = (
        <Stack spacing={3}>
          <Skeleton height="18px" />
          <Skeleton height="18px" />
          <Skeleton height="18px" />
        </Stack>
      )
    } else if (detailQuery.isError) {
      body = <ErrorState onRetry={detailQuery.refetch} />
    } else if (!detailQuery.data) {
      body = <EmptyState title="정보가 없습니다" description="사물함 상세를 불러올 수 없습니다." />
    } else {
      const detail = detailQuery.data
      body = (
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Text fontSize="2xl" fontWeight="bold">
              #{detail.visibleNum} · {detail.floor}F
            </Text>
            <Text color={mutedText}>{detail.section}</Text>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Text fontWeight="bold">현재 사용자</Text>
            <Text color={mutedText}>
              {detail.lentUserName ?? '대여 중인 사용자가 없습니다.'}
            </Text>
            {detail.lentStartedAt && (
              <Text fontSize="sm" color={mutedText}>
                시작: {detail.lentStartedAt}
              </Text>
            )}
            {detail.lentExpiredAt && (
              <Text fontSize="sm" color={mutedText}>
                만료 예정: {detail.lentExpiredAt}
              </Text>
            )}
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Text fontWeight="bold">직전 사용자</Text>
            <Text color={mutedText}>
              {detail.previousUserName ?? '직전 사용 기록이 없습니다.'}
            </Text>
            {detail.previousEndedAt && (
              <Text fontSize="sm" color={mutedText}>
                반납일: {detail.previousEndedAt}
              </Text>
            )}
          </Stack>
          <Divider />
          <Stack spacing={2}>
            {!hasLocker && (
              <Button
                colorScheme="brand"
                isDisabled={!isLoggedIn || detail.status !== 'AVAILABLE'}
                isLoading={rentMutation.isPending && rentMutation.variables === detail.visibleNum}
                onClick={() =>
                  isLoggedIn &&
                  detail.status === 'AVAILABLE' &&
                  rentMutation.mutate(detail.visibleNum, {
                    onSuccess: () => markCabinetRented(detail.visibleNum),
                  })
                }
              >
                {isLoggedIn ? '이 사물함 대여하기' : '로그인 후 대여 가능'}
              </Button>
            )}
            {hasLocker && (
              <Button
                variant="outline"
                colorScheme="brand"
                isDisabled={!canSwapSelected}
                onClick={() => {
                  if (!canSwapSelected) return
                  setSelectedCabinetId(detail.cabinetId)
                  handleSwapStart()
                }}
              >
                이사하기
              </Button>
            )}
          </Stack>
        </Stack>
      )
    }

    return (
      <Drawer
        isOpen={detailDrawer.isOpen}
        placement="right"
        size="sm"
        onClose={() => {
          detailDrawer.onClose()
          setDetailCabinetId(null)
        }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>사물함 상세</DrawerHeader>
          <DrawerBody>{body}</DrawerBody>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Box maxW="980px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <PageHeader
          title="섹션별 사물함"
          description="SUBAK의 수박 지도에서 위치를 선택하고, 상세 화면에서 실시간 상태를 확인한 뒤 대여하세요."
        />

        {!isLoggedIn && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            로그인 후 대여 버튼이 활성화됩니다.
          </Alert>
        )}

        {viewMode === 'map' && (
          <>
            <Stack spacing={3} align="center">
              <Text fontWeight="bold">층 선택</Text>
              <Wrap justify="center" spacing="12px" mt="16px" mb="16px">
                {lockerFloors.map((floor) => (
                  <WrapItem key={floor}>
                    <Button
                      minW="92px"
                      height="44px"
                      borderRadius="12px"
                      variant={activeFloor === floor ? 'solid' : 'outline'}
                      colorScheme="brand"
                      onClick={() => {
                        setActiveFloor(floor)
                        setActiveSectionId(null)
                      }}
                    >
                      {floor}F
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </Stack>

            {activeFloor !== null && sectionsForFloor.length > 0 ? (
              <FloorSectionMap
                floor={activeFloor}
                sections={sectionsForFloor}
                activeSectionId={activeSectionId}
                onSelect={handleSectionSelect}
                sectionStats={sectionStats}
              />
            ) : (
              <EmptyState title="지도 정보가 없습니다" description="다른 층을 선택해 주세요." />
            )}
          </>
        )}

        {viewMode === 'detail' && (
          <Stack
            ref={mapContainerRef}
            spacing={5}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="xl"
            p={{ base: 4, md: 6 }}
            bg={cardBg}
            shadow="sm"
          >
            <Button variant="ghost" alignSelf="flex-start" onClick={() => setViewMode('map')}>
              ← 지도 보기
            </Button>

            {cabinetsQuery.isLoading ? (
              <LoadingState label="사물함 정보를 불러오는 중입니다." />
            ) : cabinetsQuery.isError ? (
              <ErrorState onRetry={cabinetsQuery.refetch} />
            ) : !currentSection ? (
              <EmptyState title="선택된 섹션이 없습니다." description="다른 섹션을 선택해 주세요." />
            ) : cabinetsForSection.length === 0 ? (
              <EmptyState title="표시할 사물함이 없습니다" description="다른 섹션을 선택해 주세요." />
            ) : (
              <>
                <Box>
                  <Text fontSize="sm" color={mutedText}>
                    {currentSection.floor}F / 섹션 {currentSection.id}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold">
                    {currentSection.title}
                  </Text>
                  <Text color={mutedText}>{currentSection.description}</Text>
                </Box>

                <Stack spacing={2} align="center">
                  <HStack spacing={4}>
                    <IconButton
                      aria-label="이전 보기"
                      icon={<MdChevronLeft />}
                      variant="ghost"
                      onClick={() => setSectionPageIndex((prev) => Math.max(0, prev - 1))}
                      isDisabled={sectionPageIndex === 0}
                    />
                    <Stack spacing={0} textAlign="center">
                      <Text fontWeight="bold">
                        {currentSection.floor}층 - {currentSection.title}{' '}
                        {chunkedCabinets.length > 1
                          ? `(${sectionPageIndex + 1}/${chunkedCabinets.length})`
                          : ''}
                      </Text>
                      <Text fontSize="sm" color={mutedText}>
                        섹션 {currentSection.id}-{sectionPageIndex + 1}
                      </Text>
                    </Stack>
                    <IconButton
                      aria-label="다음 보기"
                      icon={<MdChevronRight />}
                      variant="ghost"
                      onClick={() =>
                        setSectionPageIndex((prev) =>
                          Math.min(chunkedCabinets.length - 1, prev + 1),
                        )
                      }
                      isDisabled={sectionPageIndex >= chunkedCabinets.length - 1}
                    />
                  </HStack>
                  <Wrap justify="center" spacing={2} maxW="260px">
                    {chunkedCabinets.map((_, index) => (
                      <Box
                        key={index}
                        w="16px"
                        h="8px"
                        borderRadius="full"
                        bg={index === sectionPageIndex ? legendSelected : indicatorInactive}
                        cursor="pointer"
                        onClick={() => setSectionPageIndex(index)}
                      />
                    ))}
                  </Wrap>
                </Stack>

                <Wrap spacing={6}>
                  <LegendItem color={legendAvailable} label="대여 가능" />
                  <LegendItem color={legendInUse} label="대여 중/연체" />
                  <LegendItem color={legendUnavailable} label="점검/불가" />
                  <LegendItem color={legendSelected} label="선택됨" />
                </Wrap>

                <Divider />

                <Box overflowX="auto" w="full">
                  <Grid
                    templateRows="repeat(2, 1fr)"
                    gridAutoFlow="column"
                    gap={3}
                    justifyContent="flex-start"
                    alignItems="center"
                    w="max-content"
                    minW="full"
                  >
                    {displayCabinets.map((cabinet) => {
                      const isMine = me?.lentCabinetId === cabinet.cabinetId
                      const isSelected = cabinet.cabinetId === selectedCabinetId
                      const effectiveStatus = getEffectiveStatus(cabinet)
                      const palette = lockerStatusPalette[effectiveStatus] ?? defaultCardStyle
                      const statusStyle = isMine ? myLockerStyle : isSelected ? selectedPalette : palette
                      const isAvailable = effectiveStatus === 'AVAILABLE'
                      const bgImage = isAvailable
                        ? "url('/assets/images/subak_ncabi.png')"
                        : effectiveStatus === 'FULL'
                          ? "url('/assets/images/subak_cabi.png')"
                          : "url('/assets/images/subak_holding.png')"
                      return (
                        <Box
                          key={cabinet.cabinetId}
                          borderRadius="xl"
                          borderWidth={statusStyle.borderWidth ?? 1}
                          borderColor={statusStyle.border}
                          color={statusStyle.color}
                          boxSize={{ base: '72px', md: '90px' }}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          textAlign="center"
                          cursor="pointer"
                          transition="all 0.2s"
                          boxShadow={isSelected ? 'xl' : 'md'}
                          bg={statusStyle.bg}
                          bgImage={bgImage}
                          bgSize="100% 100%"
                          bgPos="center"
                          bgRepeat="no-repeat"
                          onClick={() => handleLockerSelect(cabinet)}
                        >
                          <Text
                            fontWeight="extrabold"
                            fontSize={{ base: 'lg', md: 'xl' }}
                            color={isAvailable ? 'brand.900' : 'white'}
                            textShadow="0 1px 4px rgba(0,0,0,0.45)"
                          >
                            {cabinet.visibleNum}
                          </Text>
                        </Box>
                      )
                    })}
                  </Grid>
                </Box>

                <Divider />

                {selectedCabinet ? (
                  <Stack spacing={2}>
                    <Text fontWeight="bold">
                      선택한 사물함 #{selectedCabinet.visibleNum}{' '}
                      {selectedCabinet.section && `· ${selectedCabinet.section}`}
                    </Text>
                    <Text fontSize="sm" color={mutedText}>
                      상태:{' '}
                      {resolvedStatusMeta.label}
                    </Text>
                    <HStack spacing={3} flexWrap="wrap">
                      {!hasLocker && (
                        <Button
                          mt={2}
                          colorScheme="brand"
                          isDisabled={!canRentSelected}
                          isLoading={
                            rentMutation.isPending && rentMutation.variables === selectedCabinet.visibleNum
                          }
                          onClick={handleRentSelectedCabinet}
                        >
                          {isLoggedIn ? '이 사물함 대여하기' : '로그인 후 대여 가능'}
                        </Button>
                      )}
                      {hasLocker && (
                        <Button
                          mt={2}
                          variant="outline"
                          colorScheme="brand"
                          isDisabled={!canSwapSelected}
                          onClick={handleSwapStart}
                        >
                          이사하기
                        </Button>
                      )}
                    </HStack>
                  </Stack>
                ) : (
                  <EmptyState title="선택한 사물함이 없습니다" description="사물함을 선택해 주세요." />
                )}
              </>
            )}
          </Stack>
        )}
      </Stack>

      <Modal isOpen={swapModal.isOpen} onClose={handleSwapModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {swapStep === 'confirm' ? '이사 예약' : '사물함 반납 후 이사'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody maxH="70vh" overflowY="auto">
            {swapStep === 'confirm' ? (
              <Stack spacing={4}>
                <Text fontWeight="bold">
                  이사는 취소할 수 없으며, 반납 절차를 반드시 완료해야 합니다.
                </Text>
                <Text fontSize="sm" color={mutedText}>
                  이사하기를 누르면 선택한 사물함이 15분 동안 예약되며, 그동안 다른 사용자는
                  대여할 수 없습니다.
                </Text>
                {swapTarget && (
                  <Box borderWidth={1} borderColor={borderColor} borderRadius="lg" p={4} bg={cardBg}>
                    <Text fontWeight="bold">예약 대상 사물함</Text>
                    <Text color={mutedText}>#{swapTarget.visibleNum}</Text>
                  </Box>
                )}
              </Stack>
            ) : (
              <Stack spacing={4}>
                <HStack spacing={3}>
                  <Badge colorScheme="gray">1</Badge>
                  <Text fontWeight="medium">예약 완료</Text>
                  <Divider />
                  <Badge colorScheme="green">2</Badge>
                  <Text fontWeight="bold">반납 진행</Text>
                </HStack>
                <Text fontSize="sm" color={mutedText}>
                  카메라로 비어있는 사물함 내부를 찍어주세요. 사진 검증 후 비밀번호를 입력하면
                  이사가 완료됩니다.
                </Text>
                <FormControl>
                  <FormLabel>사물함 내부 사진</FormLabel>
                  <Stack spacing={2} mb={2} align="flex-start">
                    {!swapPreviewUrl && (
                      <Button
                        size="sm"
                        onClick={swapCameraActive ? handleSwapStopCamera : handleSwapStartCamera}
                        isLoading={swapCameraStarting}
                      >
                        {swapCameraActive ? '카메라 끄기' : '카메라 켜기'}
                      </Button>
                    )}
                    {swapCameraError && (
                      <Text fontSize="sm" color="red.400">
                        {swapCameraError}
                      </Text>
                    )}
                    {swapCameraActive && !swapPreviewUrl && (
                      <Stack spacing={2} w="full">
                        <Box
                          borderWidth={1}
                          borderColor={borderColor}
                          borderRadius="md"
                          overflow="hidden"
                          bg="black"
                          minH="220px"
                          sx={{ aspectRatio: '16 / 9' }}
                        >
                          <video
                            ref={swapVideoRef}
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'block',
                              objectFit: 'cover',
                            }}
                            playsInline
                            muted
                            autoPlay
                            onLoadedMetadata={() => {
                              swapCameraReadyRef.current = true
                              setSwapCameraReady(true)
                              if (swapCameraTimeoutRef.current) {
                                clearTimeout(swapCameraTimeoutRef.current)
                                swapCameraTimeoutRef.current = null
                              }
                            }}
                            onCanPlay={() => {
                              swapCameraReadyRef.current = true
                              setSwapCameraReady(true)
                              if (swapCameraTimeoutRef.current) {
                                clearTimeout(swapCameraTimeoutRef.current)
                                swapCameraTimeoutRef.current = null
                              }
                            }}
                          />
                        </Box>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          onClick={handleSwapCapture}
                          isDisabled={!swapCameraReady}
                        >
                          {swapCameraReady ? '사진 찍기' : '카메라 준비 중...'}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                  {swapPreviewUrl && (
                    <Stack spacing={2} mb={2}>
                      <Box
                        borderWidth={1}
                        borderColor={borderColor}
                        borderRadius="md"
                        overflow="hidden"
                        bg="blackAlpha.200"
                      >
                        <img src={swapPreviewUrl} alt="이사 촬영 미리보기" style={{ width: '100%' }} />
                      </Box>
                      <Text fontSize="sm" color={mutedText}>
                        선택됨: {swapFile?.name}
                      </Text>
                      <Button size="sm" variant="outline" onClick={handleSwapRetake}>
                        다시 찍기
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        onClick={handleSwapCheckImage}
                        isDisabled={!swapFile}
                        isLoading={checkImageMutation.isPending}
                      >
                        다음 (AI 검증)
                      </Button>
                      {swapCheckError && (
                        <Text fontSize="sm" color="red.400">
                          {swapCheckError}
                        </Text>
                      )}
                      {swapCheckPassed && (
                        <Text fontSize="sm" color="green.500">
                          ✅ AI 검증 통과! 비밀번호를 입력해 주세요.
                        </Text>
                      )}
                      {swapCheckFailures >= 2 && (
                        <Button size="sm" variant="outline" colorScheme="orange" onClick={handleSwapManualReturn}>
                          수동 반납 신청
                        </Button>
                      )}
                    </Stack>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleSwapFileSelect(event.target.files?.[0] ?? null)}
                  />
                </FormControl>

                {(swapCheckPassed || swapCheckFailures >= 2 || swapForceReturn) && (
                  <>
                    <FormControl>
                      <FormLabel>이전 비밀번호 (4자리)</FormLabel>
                      <Input
                        type="text"
                        maxLength={4}
                        value={swapPassword}
                        onChange={(event) => setSwapPassword(event.target.value)}
                      />
                    </FormControl>

                    {(swapForceReturn || swapCheckFailures >= 2) && (
                      <FormControl>
                        <FormLabel>수동 반납 사유</FormLabel>
                        <Textarea
                          placeholder="AI 검사 실패 사유"
                          value={swapReason}
                          onChange={(event) => setSwapReason(event.target.value)}
                        />
                      </FormControl>
                    )}
                  </>
                )}
              </Stack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleSwapModalClose}>
              닫기
            </Button>
            {swapStep === 'confirm' ? (
              <Button
                colorScheme="brand"
                onClick={handleSwapReserve}
                isDisabled={!swapTarget}
                isLoading={reserveMutation.isPending}
              >
                이사 예약하기
              </Button>
            ) : (
              <Button
                colorScheme="brand"
                onClick={handleSwapSubmit}
                isLoading={swapMutation.isPending}
                isDisabled={
                  !swapFile ||
                  swapPassword.trim().length !== 4 ||
                  (!swapCheckPassed && swapCheckFailures < 2 && !swapForceReturn)
                }
              >
                이사하기
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {renderDetailDrawer()}
    </Box>
  )
}

interface LegendItemProps {
  color: string
  label: string
}

const LegendItem = ({ color, label }: LegendItemProps) => (
  <HStack spacing={2}>
    <Box w="14px" h="14px" borderRadius="full" bg={color} borderWidth="1px" borderColor="blackAlpha.200" />
    <Text fontSize="sm">{label}</Text>
  </HStack>
)

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items]
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks.length ? chunks : [[]]
}
