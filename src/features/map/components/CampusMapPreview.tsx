import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react'

interface CampusMapPreviewProps {
  highlight: string
}

export const CampusMapPreview = ({ highlight }: CampusMapPreviewProps) => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const previewBorder = useColorModeValue('leaf.200', 'leaf.500')
  const previewBg = useColorModeValue('linear(to-br, brand.50, leaf.50)', 'linear(to-br, gray.700, brand.700)')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box borderRadius="xl" bg={cardBg} p={6} shadow="md" borderWidth={1} borderColor={borderColor}>
      <Heading size="sm" mb={3}>
        캠퍼스 동선
      </Heading>
      <Box
        borderRadius="lg"
        borderWidth={1}
        borderStyle="dashed"
        borderColor={previewBorder}
        minH="180px"
        bgGradient={previewBg}
      />
      <Text mt={3} fontSize="sm" color={textColor}>
        {highlight}
      </Text>
    </Box>
  )
}
