import { StateMessage } from '@/components/atoms/StateMessage'

interface EmptyStateProps {
  title?: string
  description?: string
}

export const EmptyState = ({ title = '비어있는 상태예요', description = '표시할 데이터가 없습니다.' }: EmptyStateProps) => (
  <StateMessage title={title} description={description} colorScheme="gray" />
)
