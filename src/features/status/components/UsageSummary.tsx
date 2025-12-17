import { Box, HStack, SimpleGrid, Stack, Text, useColorModeValue } from '@chakra-ui/react'

interface UsageSummaryProps {
  total: number
  available: number
  occupied: number
  maintenance: number
  floors?: Array<{
    floor: number
    total: number
    available: number
    occupied: number
    maintenance: number
  }>
}

const summaryItems = [
  { key: 'available', label: '대여 가능', color: 'leaf.500' },
  { key: 'occupied', label: '사용 중', color: 'brand.400' },
  { key: 'maintenance', label: '점검 중', color: 'brand.700' },
] as const

export const UsageSummary = ({
  total,
  available,
  occupied,
  maintenance,
  floors = [],
}: UsageSummaryProps) => {
  const values = { total, available, occupied, maintenance }
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const statLabelColor = useColorModeValue('gray.500', 'gray.400')
  const floorCardBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const floorBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const floorText = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box borderRadius="xl" p={6} bg={cardBg} shadow="sm" borderWidth={1} borderColor={borderColor}>
      <Text fontSize="sm" textTransform="uppercase" color={labelColor} letterSpacing={0.5}>
        실시간 현황
      </Text>
      <Text fontSize="3xl" fontWeight="bold" mt={2}>
        {total}개 락커
      </Text>
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mt={4}>
        {summaryItems.map((item) => (
          <HStack key={item.key} spacing={3} align="center">
            <Box w={3} h={3} borderRadius="full" bg={item.color} />
            <Box>
              <Text fontSize="xs" color={statLabelColor}>
                {item.label}
              </Text>
              <Text fontWeight="semibold">{values[item.key]}</Text>
            </Box>
          </HStack>
        ))}
      </SimpleGrid>

      {floors.length > 0 ? (
        <Stack spacing={3} mt={6}>
          <Text fontSize="sm" fontWeight="semibold" color={labelColor}>
            층별 현황
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
            {floors.map((floor) => (
              <Box
                key={floor.floor}
                borderRadius="lg"
                borderWidth={1}
                borderColor={floorBorder}
                bg={floorCardBg}
                p={4}
              >
                <Text fontWeight="bold" mb={1}>
                  {floor.floor}F
                </Text>
                <Text fontSize="sm" color={floorText}>
                  총 {floor.total}개 · 대여 가능 {floor.available}개
                </Text>
                <SimpleGrid columns={3} mt={2} fontSize="xs" color={floorText}>
                  <Box>
                    <Text fontWeight="bold" color="leaf.500">
                      {floor.available}
                    </Text>
                    <Text>가능</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="brand.500">
                      {floor.occupied}
                    </Text>
                    <Text>사용중</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="brand.800">
                      {floor.maintenance}
                    </Text>
                    <Text>점검</Text>
                  </Box>
                </SimpleGrid>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      ) : (
        <Text fontSize="xs" color={labelColor} mt={4}>
          층별 상세 현황은 로그인 후 확인할 수 있습니다.
        </Text>
      )}
    </Box>
  )
}
