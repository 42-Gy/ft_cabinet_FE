import { Button, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { StateMessage } from '@/components/atoms/StateMessage'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  icon?: ReactNode
}

export const ErrorState = ({
  title = '문제가 발생했어요',
  description = '잠시 후 다시 시도해주세요.',
  onRetry,
  icon,
}: ErrorStateProps) => (
  <Stack spacing={4} align="center" py={8} w="full">
    <StateMessage title={title} description={description} icon={icon} colorScheme="red" />
    {onRetry && (
      <Button colorScheme="brand" size="sm" onClick={onRetry}>
        다시 시도
      </Button>
    )}
  </Stack>
)
