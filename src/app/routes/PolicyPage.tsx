import { Alert, AlertDescription, AlertIcon, Box, ListItem, SimpleGrid, Text, UnorderedList } from '@chakra-ui/react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { env } from '@/libs/env'

export const PolicyPage = () => {
  const policyHighlights = [
    {
      title: '대여 기간',
      description: '최대 10일 연속 사용 가능하며, 만료 24시간 전에 알림 메일을 발송합니다.',
    },
    {
      title: '연장 규칙',
      description: '연속 연장은 2회까지 가능하며, 공유존 재고가 부족할 경우 자동 연장 제한이 걸릴 수 있습니다.',
    },
    {
      title: '운영지원',
      description: `${env.policyContact} / ${env.policyEmail} 으로 문의해주세요.`,
    },
  ]

  return (
    <Box>
      <PageHeader
        title="사물함 정책"
        description={`최종 업데이트: ${env.policyUpdatedAt}. 환경변수 기반으로 쉽게 수정할 수 있도록 구성했습니다.`}
      />

      <Alert status="info" borderRadius="lg" mb={6}>
        <AlertIcon />
        <AlertDescription>{env.policySummary}</AlertDescription>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={10}>
        {policyHighlights.map((item) => (
          <Box key={item.title} p={5} borderRadius="lg" bg="white" borderWidth={1} borderColor="gray.100">
            <Text fontWeight="bold" mb={2}>
              {item.title}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {item.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box borderRadius="lg" bg="white" p={6} borderWidth={1} borderColor="gray.100">
        <Text fontWeight="bold" mb={4}>
          운영 수칙
        </Text>
        <UnorderedList spacing={3} color="gray.600">
          <ListItem>사물함은 개인 소지품 보관 용도로만 활용하며, 음식물은 보관하지 않습니다.</ListItem>
          <ListItem>한 달에 1회 이상 오프라인 점검을 진행하며, 점검 일정은 최소 3일 전에 공지합니다.</ListItem>
          <ListItem>무단 점유가 확인되면 즉시 회수되고 7일간 재예약이 제한됩니다.</ListItem>
          <ListItem>정책이 변경될 경우 {env.policyEmail} 로 최신 내용을 전달합니다.</ListItem>
        </UnorderedList>
      </Box>
    </Box>
  )
}
