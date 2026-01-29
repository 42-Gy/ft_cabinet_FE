import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  Switch,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useMeQuery } from '@/features/users/hooks/useMeQuery'
import {
  useAutoExtensionMutation,
  useCheckReturnImageMutation,
  useExtendTicketMutation,
  usePenaltyTicketMutation,
  useReturnCabinetMutation,
} from '@/features/lockers/hooks/useLockerData'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/utils/date'
import type { UserItemType } from '@/types/user'

export const MyLockersPage = () => {
  const { data: me, isLoading, isError, refetch } = useMeQuery()
  const returnMutation = useReturnCabinetMutation()
  const imageCheckMutation = useCheckReturnImageMutation()
  const extendMutation = useExtendTicketMutation()
  const penaltyMutation = usePenaltyTicketMutation()
  const autoExtensionMutation = useAutoExtensionMutation()
  const returnModal = useDisclosure()
  const [returnFile, setReturnFile] = useState<File | null>(null)
  const [returnPreviewUrl, setReturnPreviewUrl] = useState<string | null>(null)
  const [returnPassword, setReturnPassword] = useState('')
  const [forceReturn, setForceReturn] = useState(false)
  const [forceReason, setForceReason] = useState('')
  const [returnStep, setReturnStep] = useState<'photo' | 'password'>('photo')
  const [imageCheckPassed, setImageCheckPassed] = useState(false)
  const [imageCheckFailures, setImageCheckFailures] = useState(0)
  const [imageCheckError, setImageCheckError] = useState<string | null>(null)
  const [autoExtensionEnabled, setAutoExtensionEnabled] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraStarting, setCameraStarting] = useState(false)
  const [historyTab, setHistoryTab] = useState<'coin' | 'item'>('coin')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cameraReadyRef = useRef(false)
  const cameraTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.400')
  const itemBg = useColorModeValue('gray.50', 'gray.700')
  const earnColor = useColorModeValue('leaf.600', 'leaf.300')
  const spendColor = useColorModeValue('red.500', 'red.300')
  const itemTypeLabels: Record<UserItemType, string> = {
    EXTENSION: '연장권',
    SWAP: '이사권',
    PENALTY_EXEMPTION: '패널티 감면권',
    LENT: '대여권',
  }

  const myItems = me?.myItems ?? []
  const coinHistories = me?.coinHistories ?? []
  const itemHistories = me?.itemHistories ?? []
  const usedItemHistories = useMemo(
    () => itemHistories.filter((history) => history.status === 'USED' || Boolean(history.usedAt)),
    [itemHistories],
  )
  const itemCounts = useMemo(() => {
    return myItems.reduce<Record<UserItemType, number>>((acc, item) => {
      acc[item.itemType] = (acc[item.itemType] ?? 0) + 1
      return acc
    }, {} as Record<UserItemType, number>)
  }, [myItems])

  useEffect(() => {
    if (typeof me?.autoExtensionEnabled === 'boolean') {
      setAutoExtensionEnabled(me.autoExtensionEnabled)
    }
  }, [me?.autoExtensionEnabled])

  useEffect(() => {
    return () => {
      if (returnPreviewUrl) URL.revokeObjectURL(returnPreviewUrl)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (cameraTimeoutRef.current) {
        clearTimeout(cameraTimeoutRef.current)
        cameraTimeoutRef.current = null
      }
    }
  }, [returnPreviewUrl])

  useEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current
    if (!video || !stream || !cameraActive) return

    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    requestAnimationFrame(() => {
      video.play().catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[Camera] video play failed', error)
        setCameraError('카메라 재생을 시작할 수 없습니다.')
      })
    })
  }, [cameraActive])

  useEffect(() => {
    if (returnModal.isOpen) {
      handleStartCamera()
      return
    }
    handleStopCamera()
  }, [returnModal.isOpen])

  if (isLoading) return <LoadingState label="내 정보를 불러오는 중입니다." />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!me) {
    return (
      <EmptyState
        title="로그인이 필요해요"
        description="우측 상단의 로그인 버튼을 눌러 로그인한 뒤 이용해 주세요."
      />
    )
  }

  const hasLocker = Boolean(me.lentCabinetId)

  const getCount = (type: UserItemType) => itemCounts[type] ?? 0

  const handleUseTicket = (type: UserItemType) => {
    if (getCount(type) === 0) return
    if (type === 'EXTENSION') {
      if (!hasLocker) return
      extendMutation.mutate()
      return
    }
    if (type === 'PENALTY_EXEMPTION') {
      penaltyMutation.mutate()
      return
    }
    if (type === 'SWAP') {
      if (!hasLocker) return
      navigate('/lockers', { state: { swap: true } })
    }
  }

  const handleReturnClose = () => {
    if (returnPreviewUrl) URL.revokeObjectURL(returnPreviewUrl)
    setReturnFile(null)
    setReturnPreviewUrl(null)
    setReturnPassword('')
    setForceReturn(false)
    setForceReason('')
    setReturnStep('photo')
    setImageCheckPassed(false)
    setImageCheckFailures(0)
    setImageCheckError(null)
    setCameraError(null)
    handleStopCamera()
    returnModal.onClose()
  }

  const handleReturnSubmit = () => {
    if (!returnFile || returnPassword.trim().length !== 4) return
    returnMutation.mutate(
      {
        file: returnFile,
        previousPassword: returnPassword.trim(),
        forceReturn: forceReturn || imageCheckFailures >= 2,
        reason:
          forceReturn || imageCheckFailures >= 2 ? forceReason.trim() || undefined : undefined,
      },
      {
        onSuccess: () => {
          handleReturnClose()
        },
        onSettled: () => {
          setReturnFile(null)
          setReturnPassword('')
          setForceReturn(false)
          setForceReason('')
          setImageCheckPassed(false)
          setImageCheckFailures(0)
          setImageCheckError(null)
        },
      },
    )
  }

  const handleCheckImage = () => {
    if (!returnFile) return
    setImageCheckError(null)
    imageCheckMutation.mutate(returnFile, {
      onSuccess: () => {
        setImageCheckPassed(true)
        handleStopCamera()
        setReturnStep('password')
      },
      onError: () => {
        setImageCheckPassed(false)
        setImageCheckFailures((prev) => prev + 1)
        const remaining = Math.max(0, 2 - (imageCheckFailures + 1))
        setImageCheckError(`관리자 수동 반납 신청 버튼 활성화까지 ${remaining}회 남았습니다`)
      },
    })
  }

  const handleManualReturnStart = () => {
    setForceReturn(true)
    handleStopCamera()
    setReturnStep('password')
  }

  const handleAutoExtensionToggle = (enabled: boolean) => {
    setAutoExtensionEnabled(enabled)
    autoExtensionMutation.mutate(enabled, {
      onError: () => setAutoExtensionEnabled((prev) => !prev),
    })
  }

  const isStreamAlive = () => {
    const stream = streamRef.current
    if (!stream) return false
    return stream.getTracks().some((track) => track.readyState === 'live')
  }

  const handleStartCamera = async () => {
    if (cameraStarting) return
    if (cameraActive && isStreamAlive()) return
    try {
      setCameraError(null)
      setCameraReady(false)
      setCameraStarting(true)
      cameraReadyRef.current = false
      // Debug logging to trace camera flow in production
      // eslint-disable-next-line no-console
      console.info('[Camera] start requested')
      if (cameraTimeoutRef.current) {
        clearTimeout(cameraTimeoutRef.current)
        cameraTimeoutRef.current = null
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        // eslint-disable-next-line no-console
        console.warn('[Camera] mediaDevices.getUserMedia not available')
        setCameraError('이 브라우저에서는 카메라를 사용할 수 없습니다.')
        setCameraStarting(false)
        return
      }
      // stop any previous stream before starting a new one
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      streamRef.current = stream
      // eslint-disable-next-line no-console
      console.info('[Camera] stream acquired', {
        tracks: stream.getTracks().map((track) => ({
          kind: track.kind,
          label: track.label,
          readyState: track.readyState,
        })),
      })
      setCameraActive(true)
      cameraTimeoutRef.current = setTimeout(() => {
        const video = videoRef.current
        const isReady =
          Boolean(video && video.readyState >= 2 && video.videoWidth && video.videoHeight) ||
          cameraReadyRef.current
        if (isReady) {
          setCameraReady(true)
          return
        }
          // eslint-disable-next-line no-console
          console.warn('[Camera] ready timeout')
          setCameraError('카메라 준비가 지연되고 있습니다. 다시 시도해 주세요.')
          setCameraStarting(false)
      }, 3000)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Camera] getUserMedia failed', error)
      setCameraError('카메라 접근이 허용되지 않았습니다.')
      setCameraActive(false)
    } finally {
      setCameraStarting(false)
    }
  }

  function handleStopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
    setCameraReady(false)
    cameraReadyRef.current = false
    if (cameraTimeoutRef.current) {
      clearTimeout(cameraTimeoutRef.current)
      cameraTimeoutRef.current = null
    }
  }

  const handleCapturePhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    if (!video.videoWidth || !video.videoHeight) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `return-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setReturnFile(file)
      setReturnPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
      setImageCheckPassed(false)
      setImageCheckError(null)
      handleStopCamera()
    }, 'image/jpeg', 0.9)
  }

  const handleRetakePhoto = async () => {
    setReturnFile(null)
    setReturnPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setImageCheckPassed(false)
    setImageCheckError(null)
    setReturnStep('photo')
    handleStopCamera()
    await handleStartCamera()
  }

  const handleFileSelect = (file: File | null) => {
    setReturnFile(file)
    setReturnPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
    setImageCheckPassed(false)
    setImageCheckError(null)
  }

  return (
    <Stack spacing={8}>
      <PageHeader
        title="내 사물함 & 자산"
        description="현재 코인, 대여 중인 사물함, 보유한 아이템을 한 번에 확인하세요."
      />

      <Stack spacing={6} direction={{ base: 'column', md: 'row' }} align="flex-start">
        <Box
          flex={{ base: 'none', md: 1 }}
          w={{ base: 'full', md: 'auto' }}
          borderRadius="xl"
          bg={cardBg}
          p={6}
          shadow="md"
          borderWidth={1}
          borderColor={borderColor}
        >
          <Stack spacing={3}>
            <Text fontSize="lg" fontWeight="bold">
              내 계정
            </Text>
            <Text fontSize="sm" color={textMuted}>
              {me.name} · {me.email}
            </Text>
            <Badge colorScheme="purple" w="fit-content">
              수박씨 {(me.coin ?? 0).toLocaleString()}개
            </Badge>
            <Text fontSize="sm" color={textMuted}>
              이번 달 로그타임: {(me.monthlyLogtime ?? 0).toLocaleString()}분
            </Text>
            <Text fontSize="sm" color={textMuted}>
              패널티 일수: {me.penaltyDays ?? 0}일
            </Text>
          </Stack>

          <Divider my={6} />

          {hasLocker ? (
            <Stack spacing={3}>
              <Badge colorScheme="green" w="fit-content">
                사용 중
              </Badge>
              <Text fontSize="2xl" fontWeight="bold">
                #{me.visibleNum} · {me.section}
              </Text>
              {me.lentStartedAt && (
                <Text fontSize="sm" color={textMuted}>
                  대여 시작: {formatDate(me.lentStartedAt)}
                </Text>
              )}
              {(() => {
                const expiresAt = me.expiredAt ?? me.lentExpiredAt ?? null
                if (!expiresAt) return null
                return (
                  <Text fontSize="sm" color={textMuted}>
                    만료 예정: {formatDate(expiresAt)}
                  </Text>
                )
              })()}
              {me.previousPassword && (
                <Text fontSize="sm" color={textMuted}>
                  이전 비밀번호: {me.previousPassword}
                </Text>
              )}
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>자동 연장</FormLabel>
                <Switch
                  isChecked={autoExtensionEnabled}
                  onChange={(event) => handleAutoExtensionToggle(event.target.checked)}
                  isDisabled={autoExtensionMutation.isPending}
                />
              </FormControl>
              <Button colorScheme="red" onClick={returnModal.onOpen} alignSelf="flex-start">
                반납하기
              </Button>
            </Stack>
          ) : (
            <EmptyState
              title="대여 중인 사물함이 없습니다"
              description="사물함 페이지에서 원하는 섹션을 선택하고 대여 버튼을 눌러보세요."
            />
          )}
        </Box>

        <Box
          flex={{ base: 'none', md: 1 }}
          w={{ base: 'full', md: 'auto' }}
          borderRadius="xl"
          bg={cardBg}
          p={6}
          shadow="md"
          borderWidth={1}
          borderColor={borderColor}
        >
          <Stack spacing={3}>
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
              <Text fontSize="lg" fontWeight="bold">
                내 아이템
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant={historyTab === 'coin' ? 'solid' : 'outline'}
                  colorScheme="brand"
                  onClick={() => setHistoryTab('coin')}
                >
                  수박씨 내역
                </Button>
                <Button
                  size="sm"
                  variant={historyTab === 'item' ? 'solid' : 'outline'}
                  colorScheme="brand"
                  onClick={() => setHistoryTab('item')}
                >
                  아이템 사용 내역
                </Button>
              </HStack>
            </HStack>
            <Stack spacing={3}>
              <TicketCard
                title="연장권"
                description="현재 사물함을 15일 연장합니다."
                count={getCount('EXTENSION')}
                buttonLabel="연장하기"
                onClick={() => handleUseTicket('EXTENSION')}
                isLoading={extendMutation.isPending}
                isDisabled={!hasLocker}
                bg={itemBg}
                textMuted={textMuted}
                borderColor={borderColor}
              />
              <TicketCard
                title="이사권"
                description="다른 번호로 이동할 수 있습니다."
                count={getCount('SWAP')}
                buttonLabel="이동하기"
                onClick={() => handleUseTicket('SWAP')}
                isDisabled={!hasLocker}
                bg={itemBg}
                textMuted={textMuted}
                borderColor={borderColor}
              />
              <TicketCard
                title="패널티 감면권"
                description="패널티 일수를 1회 면제합니다."
                count={getCount('PENALTY_EXEMPTION')}
                buttonLabel="감면하기"
                onClick={() => handleUseTicket('PENALTY_EXEMPTION')}
                isLoading={penaltyMutation.isPending}
                bg={itemBg}
                textMuted={textMuted}
                borderColor={borderColor}
              />
              <TicketCard
                title="대여권"
                description="출석/미션 보상으로만 사용할 수 있습니다."
                count={getCount('LENT')}
                buttonLabel="관리자 지급"
                onClick={() => {}}
                isDisabled
                bg={itemBg}
                textMuted={textMuted}
                borderColor={borderColor}
              />
            </Stack>

            <Divider my={4} />

            {historyTab === 'coin' ? (
              coinHistories.length === 0 ? (
                <EmptyState
                  title="수박씨 내역이 없습니다"
                  description="출석 보상이나 아이템 사용 내역이 아직 없습니다."
                />
              ) : (
                <Box maxH={{ base: '320px', md: '360px' }} overflowY="auto" pr={1}>
                  <Stack spacing={3}>
                    {coinHistories.map((history, index) => (
                      <Box
                        key={`${history.date}-${history.type}-${index}`}
                        borderRadius="md"
                        bg={itemBg}
                        px={4}
                        py={3}
                      >
                        <HStack justify="space-between" align="center">
                          <Stack spacing={1}>
                            <Text fontWeight="semibold">
                              {history.reason ?? '수박씨 변동'}
                            </Text>
                            <Text fontSize="sm" color={textMuted}>
                              {formatDate(history.date)}
                            </Text>
                          </Stack>
                          <Text
                            fontWeight="bold"
                            color={history.type === 'EARN' ? earnColor : spendColor}
                          >
                            {history.amount > 0 ? '+' : ''}
                            {history.amount.toLocaleString()} 수박씨
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )
            ) : usedItemHistories.length === 0 ? (
              <EmptyState
                title="사용한 아이템 내역이 없습니다"
                description="아이템 사용 기록이 아직 없습니다."
              />
            ) : (
              <Box maxH={{ base: '320px', md: '360px' }} overflowY="auto" pr={1}>
                <Stack spacing={3}>
                  {usedItemHistories.map((history, index) => {
                    const label =
                      itemTypeLabels[history.itemType as UserItemType] ??
                      history.itemName ??
                      '아이템'
                    return (
                      <Box
                        key={`${history.date}-${history.itemType}-${index}`}
                        borderRadius="md"
                        bg={itemBg}
                        px={4}
                        py={3}
                      >
                        <HStack justify="space-between" align="center">
                          <Stack spacing={1}>
                            <Text fontWeight="semibold">{label}</Text>
                            <Text fontSize="sm" color={textMuted}>
                              {formatDate(history.date)}
                            </Text>
                          </Stack>
                          <Stack spacing={1} textAlign="right">
                            <Text fontWeight="bold">사용됨</Text>
                            {history.usedAt && (
                              <Text fontSize="sm" color={textMuted}>
                                사용일시: {formatDate(history.usedAt)}
                              </Text>
                            )}
                          </Stack>
                        </HStack>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>
            )}
          <Divider my={6} />
          <Button as={RouterLink} to="/store" colorScheme="brand" variant="solid">
            스토어 바로가기
          </Button>
        </Stack>
      </Box>

      <Modal isOpen={returnModal.isOpen} onClose={handleReturnClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>사물함 반납</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <HStack spacing={3}>
                <Badge colorScheme={returnStep === 'photo' ? 'green' : 'gray'}>1</Badge>
                <Text fontWeight={returnStep === 'photo' ? 'bold' : 'medium'}>사진 검증</Text>
                <Divider />
                <Badge colorScheme={returnStep === 'password' ? 'green' : 'gray'}>2</Badge>
                <Text fontWeight={returnStep === 'password' ? 'bold' : 'medium'}>비밀번호 입력</Text>
              </HStack>
              {returnStep === 'photo' && (
                <Stack spacing={4}>
                  <Text fontSize="sm" color={textMuted}>
                    카메라로 비어있는 사물함 내부를 찍어주세요. 사진 검증을 통과하면 다음 단계로 넘어갑니다.
                  </Text>
                  <FormControl>
                    <FormLabel>사물함 내부 사진</FormLabel>
                    <Stack spacing={2} mb={2} align="flex-start">
                      {!returnPreviewUrl && (
                        <Button
                          size="sm"
                          onClick={cameraActive ? handleStopCamera : handleStartCamera}
                          isLoading={cameraStarting}
                        >
                          {cameraActive ? '카메라 끄기' : '카메라 켜기'}
                        </Button>
                      )}
                      {cameraError && (
                        <Text fontSize="sm" color="red.400">
                          {cameraError}
                        </Text>
                      )}
                      {cameraActive && !returnPreviewUrl && (
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
                              ref={videoRef}
                              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                              playsInline
                              muted
                              autoPlay
                              onLoadedMetadata={() => {
                                // eslint-disable-next-line no-console
                                console.info('[Camera] loaded metadata', {
                                  width: videoRef.current?.videoWidth,
                                  height: videoRef.current?.videoHeight,
                                })
                                cameraReadyRef.current = true
                                setCameraReady(true)
                                if (cameraTimeoutRef.current) {
                                  clearTimeout(cameraTimeoutRef.current)
                                  cameraTimeoutRef.current = null
                                }
                              }}
                              onCanPlay={() => {
                                // eslint-disable-next-line no-console
                                console.info('[Camera] can play')
                                cameraReadyRef.current = true
                                setCameraReady(true)
                                if (cameraTimeoutRef.current) {
                                  clearTimeout(cameraTimeoutRef.current)
                                  cameraTimeoutRef.current = null
                                }
                              }}
                            />
                          </Box>
                          <HStack>
                            <Button
                              size="sm"
                              colorScheme="brand"
                              onClick={handleCapturePhoto}
                              isDisabled={!cameraReady}
                            >
                              {cameraReady ? '사진 찍기' : '카메라 준비 중...'}
                            </Button>
                            {returnPreviewUrl && (
                              <Button size="sm" variant="outline" onClick={handleRetakePhoto}>
                                다시 사진찍기
                              </Button>
                            )}
                          </HStack>
                        </Stack>
                      )}
                    </Stack>
                    {returnPreviewUrl && (
                      <Stack spacing={2} mb={2}>
                        <Box
                          borderWidth={1}
                          borderColor={borderColor}
                          borderRadius="md"
                          overflow="hidden"
                          bg="blackAlpha.200"
                        >
                          <img src={returnPreviewUrl} alt="사물함 촬영 미리보기" style={{ width: '100%' }} />
                        </Box>
                        <Text fontSize="sm" color={textMuted}>
                          선택됨: {returnFile?.name}
                        </Text>
                        <Button size="sm" variant="outline" onClick={handleRetakePhoto}>
                          다시 찍기
                        </Button>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          onClick={handleCheckImage}
                          isDisabled={!returnFile}
                          isLoading={imageCheckMutation.isPending}
                        >
                          다음 (AI 검증)
                        </Button>
                        {imageCheckError && (
                          <Text fontSize="sm" color="red.400">
                            {imageCheckError}
                          </Text>
                        )}
                        {imageCheckFailures >= 2 && (
                          <Button
                            size="sm"
                            variant="outline"
                            colorScheme="orange"
                            onClick={handleManualReturnStart}
                          >
                            수동 제출하기
                          </Button>
                        )}
                      </Stack>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => handleFileSelect(event.target.files?.[0] ?? null)}
                    />
                  </FormControl>
                </Stack>
              )}
              {returnStep === 'password' && (
                <Stack spacing={4}>
                  <Text fontSize="sm" color={textMuted}>
                    사진 확인이 완료되었습니다. 비밀번호를 입력하고 반납을 완료하세요.
                  </Text>
                  <FormControl>
                    <FormLabel>이전 비밀번호 (4자리)</FormLabel>
                    <Input
                      type="text"
                      maxLength={4}
                      value={returnPassword}
                      onChange={(event) => setReturnPassword(event.target.value)}
                    />
                  </FormControl>
                  {forceReturn && (
                    <FormControl>
                      <FormLabel>수동 반납 사유</FormLabel>
                      <Textarea
                        placeholder="AI 검사 실패 사유"
                        value={forceReason}
                        onChange={(event) => setForceReason(event.target.value)}
                      />
                    </FormControl>
                  )}
                </Stack>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleReturnClose}>
              닫기
            </Button>
            {returnStep === 'password' && (
              <Button
                colorScheme="red"
                onClick={handleReturnSubmit}
                isLoading={returnMutation.isPending}
                isDisabled={
                  !returnFile ||
                  returnPassword.trim().length !== 4 ||
                  (!imageCheckPassed && !forceReturn)
                }
              >
                반납 요청
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Stack>
  )
}

interface TicketCardProps {
  title: string
  description: string
  count: number
  buttonLabel: string
  onClick: () => void
  isLoading?: boolean
  isDisabled?: boolean
  bg: string
  textMuted: string
  borderColor: string
}

const TicketCard = ({
  title,
  description,
  count,
  buttonLabel,
  onClick,
  isLoading,
  isDisabled,
  bg,
  textMuted,
  borderColor,
}: TicketCardProps) => {
  const disabled = isDisabled || count === 0

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} borderColor={borderColor} bg={bg}>
      <Stack spacing={1}>
        <HStack justify="space-between">
          <Text fontWeight="bold">{title}</Text>
          <Badge colorScheme={count > 0 ? 'green' : 'gray'}>{count}개</Badge>
        </HStack>
        <Text fontSize="sm" color={textMuted}>
          {description}
        </Text>
        <Button
          mt={3}
          size="sm"
          colorScheme="brand"
          variant={disabled ? 'outline' : 'solid'}
          onClick={onClick}
          isDisabled={disabled}
          isLoading={isLoading}
        >
          {disabled ? '사용 불가' : buttonLabel}
        </Button>
      </Stack>
    </Box>
  )
}
