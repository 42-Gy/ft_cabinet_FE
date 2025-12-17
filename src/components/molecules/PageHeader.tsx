import { Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  const descriptionColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <VStack align="flex-start" spacing={3} mb={8} w="full">
      <Heading size="lg">{title}</Heading>
      {description && (
        <Text color={descriptionColor} maxW="3xl">
          {description}
        </Text>
      )}
      {action}
    </VStack>
  )
}
