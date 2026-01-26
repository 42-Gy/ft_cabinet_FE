import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
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
  useColorModeValue,
} from '@chakra-ui/react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingState } from '@/components/molecules/LoadingState'
import { ErrorState } from '@/components/molecules/ErrorState'
import { EmptyState } from '@/components/molecules/EmptyState'
import {
  useAdminAttendanceStatsQuery,
  useAdminCabinetDetailQuery,
  useAdminCabinetHistoryQuery,
  useAdminDashboardQuery,
  useAdminOverdueCabinetsQuery,
  useAdminPendingCabinetsQuery,
  useAdminStoreStatsQuery,
  useAdminUserQuery,
  useAdminWeeklyStatsQuery,
  useCabinetForceReturnMutation,
  useCabinetStatusMutation,
  useCoinRevokeMutation,
  useCoinProvideMutation,
  useEmergencyNoticeMutation,
  useItemRevokeMutation,
  useItemGrantMutation,
  useItemPriceUpdateMutation,
  useLogtimeUpdateMutation,
  useAdminRoleDemoteMutation,
  useAdminRolePromoteMutation,
  usePenaltyAssignMutation,
  usePenaltyRemoveMutation,
  usePendingCabinetApproveMutation,
} from '@/features/admin/hooks/useAdminDashboard'
import type { CabinetLentType, CabinetStatusValue } from '@/features/admin/types'

const cabinetStatusOptions: CabinetStatusValue[] = ['AVAILABLE', 'BROKEN', 'FULL', 'OVERDUE']
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

export const AdminDashboard = () => {
  const statsQuery = useAdminDashboardQuery()
  const weeklyQuery = useAdminWeeklyStatsQuery()
  const storeQuery = useAdminStoreStatsQuery()
  const attendanceQuery = useAdminAttendanceStatsQuery()
  const pendingQuery = useAdminPendingCabinetsQuery()
  const overdueQuery = useAdminOverdueCabinetsQuery()

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

  const highlightBg = useColorModeValue('white', 'gray.800')
  const highlightBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const mutedText = useColorModeValue('gray.500', 'gray.400')

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
      { label: '전체 유저', value: Number(stats.totalUserCount ?? 0).toLocaleString() },
      { label: '전체 사물함', value: Number(stats.totalCabinetCount ?? 0).toLocaleString() },
      { label: '대여 중', value: Number(stats.activeLentCount ?? 0).toLocaleString() },
      { label: '점검 중', value: Number(stats.brokenCabinetCount ?? 0).toLocaleString() },
      { label: '패널티 유저', value: Number(stats.bannedUserCount ?? 0).toLocaleString() },
    ]
  }, [statsQuery.data])

  return (
    <Stack spacing={10}>
      <PageHeader
        title="SUBAK 관리자 콘솔"
        description="사물함과 사용자 상태를 통합 관리하는 대시보드입니다."
      />

      <Tabs variant="enclosed" colorScheme="brand">
        <TabList>
          <Tab>대시보드</Tab>
          <Tab>사용자 관리</Tab>
          <Tab>사물함 관리</Tab>
          <Tab>설정</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Stack spacing={8}>
              <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  핵심 통계
                </Text>
                {statsQuery.isLoading ? (
                  <LoadingState label="관리자 통계를 불러오는 중입니다." />
                ) : statsQuery.isError ? (
                  <ErrorState onRetry={statsQuery.refetch} />
                ) : !dashboardCards.length ? (
                  <EmptyState title="표시할 통계가 없습니다" description="잠시 후 다시 시도해 주세요." />
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {dashboardCards.map((card) => (
                      <Box key={card.label} borderWidth={1} borderRadius="lg" p={4}>
                        <Text fontSize="sm" color={mutedText}>
                          {card.label}
                        </Text>
                        <Text fontSize="3xl" fontWeight="bold">
                          {card.value}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box borderWidth={1} borderRadius="xl" p={5} bg={highlightBg} borderColor={highlightBorder}>
                  <Text fontWeight="bold" mb={2}>
                    주간 대여/반납
                  </Text>
                  {weeklyQuery.isLoading ? (
                    <LoadingState label="주간 통계를 불러오는 중입니다." />
                  ) : weeklyQuery.isError ? (
                    <ErrorState onRetry={weeklyQuery.refetch} />
                  ) : weeklyQuery.data ? (
                    <Stack spacing={1}>
                      <Text color={mutedText}>대여 시작</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {Number(weeklyQuery.data.lentsStarted ?? 0).toLocaleString()} 건
                      </Text>
                      <Text color={mutedText}>반납 완료</Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {Number(weeklyQuery.data.lentsEnded ?? 0).toLocaleString()} 건
                      </Text>
                    </Stack>
                  ) : (
                    <EmptyState title="표시할 데이터가 없습니다" />
                  )}
                </Box>

                <Box borderWidth={1} borderRadius="xl" p={5} bg={highlightBg} borderColor={highlightBorder}>
                  <Text fontWeight="bold" mb={2}>
                    재화/아이템 통계
                  </Text>
                  {storeQuery.isLoading ? (
                    <LoadingState label="스토어 통계를 불러오는 중입니다." />
                  ) : storeQuery.isError ? (
                    <ErrorState onRetry={storeQuery.refetch} />
                  ) : storeQuery.data ? (
                    <Stack spacing={2}>
                      <Text color={mutedText}>
                        보유 코인 총합: {Number(storeQuery.data.totalUserCoins ?? 0).toLocaleString()}
                      </Text>
                      <Text color={mutedText}>
                        사용된 코인: {Number(storeQuery.data.totalUsedCoins ?? 0).toLocaleString()}
                      </Text>
                      <Divider />
                      <Text fontWeight="semibold">아이템 판매</Text>
                      <Text color={mutedText}>연장권: {storeQuery.data.itemSales?.extensionTicket ?? 0}개</Text>
                      <Text color={mutedText}>이사권: {storeQuery.data.itemSales?.swapTicket ?? 0}개</Text>
                      <Text color={mutedText}>알림권: {storeQuery.data.itemSales?.alarm ?? 0}개</Text>
                    </Stack>
                  ) : (
                    <EmptyState title="표시할 데이터가 없습니다" />
                  )}
                </Box>

                <Box borderWidth={1} borderRadius="xl" p={5} bg={highlightBg} borderColor={highlightBorder}>
                  <Text fontWeight="bold" mb={2}>
                    최근 30일 출석
                  </Text>
                  {attendanceQuery.isLoading ? (
                    <LoadingState label="출석 통계를 불러오는 중입니다." />
                  ) : attendanceQuery.isError ? (
                    <ErrorState onRetry={attendanceQuery.refetch} />
                  ) : attendanceQuery.data?.length ? (
                    <Stack spacing={2} maxH="220px" overflowY="auto">
                      {attendanceQuery.data.map((item) => (
                        <HStack key={item.date} justify="space-between">
                          <Text color={mutedText}>{item.date}</Text>
                          <Text fontWeight="semibold">{item.count}</Text>
                        </HStack>
                      ))}
                    </Stack>
                  ) : (
                    <EmptyState title="표시할 데이터가 없습니다" />
                  )}
                </Box>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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
            <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
              <Stack spacing={4}>
                <Text fontSize="lg" fontWeight="bold">
                  사용자 관리
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
                    <HStack spacing={3}>
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
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <InfoItem label="코인" value={`${Number(userData.coin ?? 0).toLocaleString()} 개`} />
                      <InfoItem label="패널티 일수" value={`${userData.penaltyDays ?? 0} 일`} />
                      <InfoItem label="이번 달 학습 시간" value={`${userData.monthlyLogtime ?? 0} 분`} />
                      <InfoItem
                        label="대여 중 사물함"
                        value={userData.currentCabinetNum ? `#${userData.currentCabinetNum}` : '없음'}
                      />
                    </SimpleGrid>
                    <Divider />
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>코인 지급</FormLabel>
                        <Stack spacing={2}>
                          <NumberInput value={coinAmount} min={1} onChange={(value) => setCoinAmount(value)}>
                            <NumberInputField placeholder="지급 코인" />
                          </NumberInput>
                          <Textarea
                            placeholder="지급 사유"
                            value={coinReason}
                            onChange={(event) => setCoinReason(event.target.value)}
                          />
                          <HStack spacing={3}>
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
                            <Button
                              colorScheme="red"
                              variant="outline"
                              isLoading={coinRevokeMutation.isPending}
                              onClick={() =>
                                coinRevokeMutation.mutate(
                                  {
                                    name: userData.name,
                                    payload: { amount: Number(coinAmount), reason: coinRevokeReason },
                                  },
                                  { onSuccess: () => userQuery.refetch() },
                                )
                              }
                            >
                              코인 회수
                            </Button>
                          </HStack>
                          <Textarea
                            placeholder="회수 사유"
                            value={coinRevokeReason}
                            onChange={(event) => setCoinRevokeReason(event.target.value)}
                          />
                        </Stack>
                      </FormControl>
                      <FormControl>
                        <FormLabel>이번 달 학습 시간 수정 (분)</FormLabel>
                        <Stack spacing={2}>
                          <NumberInput value={logtimeValue} min={0} onChange={(value) => setLogtimeValue(value)}>
                            <NumberInputField placeholder="예: 1200" />
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
                        </Stack>
                      </FormControl>
                    </SimpleGrid>
                    <Divider />
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>패널티 부여</FormLabel>
                        <Stack spacing={2}>
                          <NumberInput value={penaltyDays} min={1} onChange={(value) => setPenaltyDays(value)}>
                            <NumberInputField placeholder="패널티 일수" />
                          </NumberInput>
                          <Textarea
                            placeholder="부여 사유"
                            value={penaltyReason}
                            onChange={(event) => setPenaltyReason(event.target.value)}
                          />
                          <HStack spacing={3}>
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
                        <FormLabel>아이템 지급</FormLabel>
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
                          <Select value={itemRevokeName} onChange={(event) => setItemRevokeName(event.target.value)}>
                            {itemGrantOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                          <Button
                            colorScheme="red"
                            variant="outline"
                            isLoading={itemRevokeMutation.isPending}
                            onClick={() =>
                              itemRevokeMutation.mutate(
                                {
                                  name: userData.name,
                                  payload: { itemName: itemRevokeName },
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
          </TabPanel>

          <TabPanel px={0}>
            <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
              <Stack spacing={4}>
                <Text fontSize="lg" fontWeight="bold">
                  사물함 관리
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
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
                      {cabinetStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
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
                      {cabinetLentTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>상태 메모</FormLabel>
                    <Input
                      placeholder="상태 메모"
                      value={cabinetNote}
                      onChange={(event) => setCabinetNote(event.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
                <HStack spacing={3}>
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
                          statusNote: cabinetNote || undefined,
                        },
                      })
                    }
                  >
                    상태 변경
                  </Button>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    isLoading={forceReturnMutation.isPending}
                    isDisabled={!isCabinetNumberValid}
                    onClick={() => forceReturnMutation.mutate(cabinetNumber)}
                  >
                    강제 반납
                  </Button>
                </HStack>

                <Divider />

                <Stack spacing={3}>
                  <Text fontWeight="bold">사물함 상세</Text>
                  {cabinetDetailQuery.isLoading ? (
                    <LoadingState label="사물함 정보를 불러오는 중입니다." />
                  ) : cabinetDetailQuery.isError ? (
                    <ErrorState onRetry={cabinetDetailQuery.refetch} />
                  ) : cabinetDetailQuery.data ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <InfoItem label="상태" value={cabinetDetailQuery.data.status} />
                      <InfoItem label="대여 타입" value={cabinetDetailQuery.data.lentType} />
                      <InfoItem label="구역" value={cabinetDetailQuery.data.section} />
                      <InfoItem label="위치" value={cabinetDetailQuery.data.location} />
                      <InfoItem
                        label="현재 사용자"
                        value={cabinetDetailQuery.data.currentUserName ?? '없음'}
                      />
                    </SimpleGrid>
                  ) : (
                    <EmptyState title="사물함 번호를 입력해 주세요" />
                  )}
                </Stack>

                <Divider />

                <Stack spacing={3}>
                  <Text fontWeight="bold">사물함 대여 이력</Text>
                  {cabinetHistoryQuery.isLoading ? (
                    <LoadingState label="대여 이력을 불러오는 중입니다." />
                  ) : cabinetHistoryQuery.isError ? (
                    <ErrorState onRetry={cabinetHistoryQuery.refetch} />
                  ) : cabinetHistoryQuery.data?.content?.length ? (
                    <Stack spacing={2}>
                      {cabinetHistoryQuery.data.content.map((item) => (
                        <Box key={item.lentHistoryId} borderWidth={1} borderRadius="lg" p={3}>
                          <Text fontWeight="semibold">{item.userName}</Text>
                          <Text fontSize="sm" color={mutedText}>
                            시작: {item.startedAt}
                          </Text>
                          <Text fontSize="sm" color={mutedText}>
                            종료: {item.endedAt ?? '대여 중'}
                          </Text>
                        </Box>
                      ))}
                      <HStack spacing={3}>
                        <Button
                          size="sm"
                          variant="outline"
                          isDisabled={historyPage === 0}
                          onClick={() => setHistoryPage((prev) => Math.max(prev - 1, 0))}
                        >
                          이전
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          isDisabled={historyPage + 1 >= (cabinetHistoryQuery.data.totalPages ?? 1)}
                          onClick={() =>
                            setHistoryPage((prev) =>
                              Math.min(prev + 1, (cabinetHistoryQuery.data.totalPages ?? 1) - 1),
                            )
                          }
                        >
                          다음
                        </Button>
                      </HStack>
                    </Stack>
                  ) : (
                    <EmptyState title="대여 이력이 없습니다" />
                  )}
                </Stack>
              </Stack>
            </Box>
          </TabPanel>

          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box borderWidth={1} borderRadius="xl" p={6} bg={highlightBg} borderColor={highlightBorder}>
                <Stack spacing={3}>
                  <Text fontWeight="bold">아이템 가격 관리</Text>
                  <Select value={priceItemName} onChange={(event) => setPriceItemName(event.target.value)}>
                    {priceItemOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <NumberInput value={priceValue} min={0} onChange={(value) => setPriceValue(value)}>
                    <NumberInputField placeholder="가격" />
                  </NumberInput>
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
                <Stack spacing={3}>
                  <Text fontWeight="bold">긴급 공지 발송</Text>
                  <Textarea
                    value={emergencyMessage}
                    onChange={(event) => setEmergencyMessage(event.target.value)}
                    placeholder="긴급 공지 내용을 입력하세요."
                    minH="140px"
                  />
                  <Button
                    colorScheme="red"
                    isLoading={emergencyNoticeMutation.isPending}
                    onClick={() => emergencyNoticeMutation.mutate({ message: emergencyMessage })}
                  >
                    공지 발송
                  </Button>
                </Stack>
              </Box>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  )
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Text fontSize="sm" color="gray.500">
      {label}
    </Text>
    <Text fontWeight="bold">{value}</Text>
  </Box>
)
