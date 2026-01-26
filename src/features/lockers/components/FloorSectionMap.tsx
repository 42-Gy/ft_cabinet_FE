import { Box, Button, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import type { LockerSectionMeta } from '@/types/locker'

interface AreaConfig {
  x: number
  y: number
  width: number
  height: number
  color: string
  label: string
}

interface SectionAreaConfig {
  sectionId: number
  x: number
  y: number
  width: number
  height: number
}

interface MapLayout {
  cols: number
  rows: number
  areas: AreaConfig[]
  sections: SectionAreaConfig[]
}

const mapLayouts: Record<number, MapLayout> = {
  2: {
    cols: 10,
    rows: 6,
    areas: [
      { x: 0, y: 0, width: 10, height: 1, color: '#dbeafe', label: '오아시스' },
      { x: 0, y: 5, width: 10, height: 1, color: '#ede9fe', label: '1클러스터' },
    ],
    sections: [
      { sectionId: 4, x: 2, y: 1, width: 6, height: 1 },
      { sectionId: 3, x: 0, y: 2, width: 1, height: 3 },
      { sectionId: 2, x: 9, y: 1, width: 1, height: 4 },
      { sectionId: 1, x: 2, y: 4, width: 6, height: 1 },
    ],
  },
  3: {
    cols: 10,
    rows: 6,
    areas: [
      { x: 0, y: 0, width: 10, height: 1, color: '#bae6fd', label: '2클러스터' },
      { x: 0, y: 5, width: 10, height: 1, color: '#fee2e2', label: '3클러스터' },
    ],
    sections: [
      { sectionId: 5, x: 2, y: 1, width: 6, height: 1 },
      { sectionId: 6, x: 0, y: 1, width: 1, height: 4 },
      { sectionId: 7, x: 9, y: 1, width: 1, height: 4 },
    ],
  },
}

interface FloorSectionMapProps {
  floor: number
  sections: LockerSectionMeta[]
  activeSectionId?: number | null
  onSelect: (section: LockerSectionMeta) => void
  sectionStats?: Record<number, { total: number; available: number }>
}

export const FloorSectionMap = ({
  floor,
  sections,
  activeSectionId,
  onSelect,
  sectionStats,
}: FloorSectionMapProps) => {
  const layout = mapLayouts[floor]
  const fallbackTextColor = useColorModeValue('gray.500', 'gray.400')
  const mapBg = useColorModeValue('gray.200', 'gray.600')
  const innerBg = useColorModeValue('white', 'gray.900')
  const innerBorder = useColorModeValue('gray.300', 'whiteAlpha.300')
  const buttonBg = useColorModeValue('white', 'gray.700')
  const buttonText = useColorModeValue('gray.700', 'gray.100')
  const buttonBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const areaText = useColorModeValue('gray.700', 'gray.100')

  if (!layout) {
    return (
      <Stack spacing={2} align="center">
        <Text color={fallbackTextColor}>지도 정보가 없어 목록으로 표시합니다.</Text>
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={section.id === activeSectionId ? 'solid' : 'outline'}
            colorScheme="brand"
            onClick={() => onSelect(section)}
          >
            {section.title}
          </Button>
        ))}
      </Stack>
    )
  }

  const cellWidth = 100 / layout.cols
  const cellHeight = 100 / layout.rows

  const getSection = (sectionId: number) => sections.find((section) => section.id === sectionId)

  return (
    <Stack spacing={4} align="center" w="full" px={{ base: 2, md: 4 }}>
      <Box
        w="100%"
        maxW="920px"
        h={{ base: '420px', md: '520px' }}
        bg={mapBg}
        borderRadius="16px"
        mx="auto"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          position="relative"
          width="92%"
          height="82%"
          bg={innerBg}
          borderRadius="lg"
          borderWidth={1}
          borderColor={innerBorder}
          overflow="visible"
        >
          {layout.areas.map((area) => (
            <Box
              key={`${area.label}-${area.x}-${area.y}`}
              position="absolute"
              left={`${area.x * cellWidth}%`}
              top={`${area.y * cellHeight}%`}
              width={`${area.width * cellWidth}%`}
              height={`${area.height * cellHeight}%`}
              bg={area.color}
              opacity={0.5}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="bold"
              color={areaText}
            >
              {area.label}
            </Box>
          ))}

          {layout.sections.map((sectionArea) => {
            const section = getSection(sectionArea.sectionId)
            if (!section) return null
            const isActive = section.id === activeSectionId
            const stats = sectionStats?.[section.id]
            return (
              <Button
                key={sectionArea.sectionId}
                position="absolute"
                left={`${sectionArea.x * cellWidth}%`}
                top={`${sectionArea.y * cellHeight}%`}
                width={`${sectionArea.width * cellWidth}%`}
                height={`${sectionArea.height * cellHeight}%`}
                variant="solid"
                size="sm"
                fontSize="xs"
                px={1}
                py={1}
                bg={isActive ? 'brand.500' : buttonBg}
                color={isActive ? 'white' : buttonText}
                borderWidth={isActive ? 2 : 1}
                borderColor={isActive ? 'brand.600' : buttonBorder}
                borderRadius="md"
                _hover={{ opacity: 0.9 }}
                onClick={() => onSelect(section)}
              >
                <Stack spacing={0} align="center">
                  <Text fontSize="xs" fontWeight="bold" lineHeight="shorter">
                    {section.title}
                  </Text>
                  <Text fontSize="10px" lineHeight="shorter">
                    총 {stats?.total ?? '-'}개
                  </Text>
                  <Text fontSize="10px" lineHeight="shorter">
                    가능 {stats?.available ?? '-'}개
                  </Text>
                </Stack>
              </Button>
            )
          })}

        </Box>
      </Box>
    </Stack>
  )
}
