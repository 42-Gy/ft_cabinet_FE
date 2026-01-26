import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface StateMessageProps {
  title: string
  description: string
  icon?: ReactNode
  colorScheme?: 'green' | 'orange' | 'red' | 'blue' | 'gray'
}

export const StateMessage = ({ title, description, icon, colorScheme = 'blue' }: StateMessageProps) => {
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const descriptionColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue(`${colorScheme}.200`, 'whiteAlpha.200')
  const bgColor = useColorModeValue(`${colorScheme}.50`, 'whiteAlpha.100')

  return (
    <Box
      w="full"
      borderWidth={1}
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      p={6}
      textAlign="center"
    >
      {icon && (
        <Box fontSize="3xl" mb={2}>
          {icon}
        </Box>
      )}
      <Heading size="md" mb={1} color={titleColor}>
        {title}
      </Heading>
      <Text fontSize="sm" color={descriptionColor}>
        {description}
      </Text>
    </Box>
  )
}
