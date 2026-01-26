import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  useColorModeValue,
} from '@chakra-ui/react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { env } from '@/libs/env'

export const PolicyPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800')
  const cardBorder = useColorModeValue('gray.100', 'whiteAlpha.200')
  const textMuted = useColorModeValue('gray.600', 'gray.300')
  const policyHighlights = [
    {
      title: '사물함 대여',
      description:
        '사물함은 1인당 1개만 대여 가능합니다. 만료 7일전 1일전 slack으로 알람이 갑니다. 파손 또는 분실이 발생한 경우 즉시 운영진에게 신고해 주세요.',
    },
    {
      title: '대여 기간',
      description:
        '대여권의 기본 사용 기간은 32일입니다. 대여 종료 시점은 서비스 화면에서 확인할 수 있으며, 필요 시 운영 정책에 따라 회수 안내가 진행될 수 있습니다.',
    },
    {
      title: '연장 규칙',
      description:
        '연장은 최대 2회까지 가능합니다. 공유존 사물함 재고가 부족한 경우 연장이 제한되거나 불가할 수 있습니다.',
    },
  ]

  return (
    <Box>
      <PageHeader title="사물함 운영 정책" description={`최종 업데이트: ${env.policyUpdatedAt}`} />

      <Alert status="info" borderRadius="lg" mb={6}>
        <AlertIcon />
        <AlertDescription>
          SUBAK 사물함은 42경산 카뎃들을 위한 공유 자산으로, 원활한 이용을 위해 아래 운영 정책을
          따릅니다.
        </AlertDescription>
      </Alert>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={10}>
        {policyHighlights.map((item) => (
          <Box
            key={item.title}
            p={5}
            borderRadius="lg"
            bg={cardBg}
            borderWidth={1}
            borderColor={cardBorder}
          >
            <Text fontWeight="bold" mb={2}>
              {item.title}
            </Text>
            <Text fontSize="sm" color={textMuted}>
              {item.description}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box borderRadius="lg" bg={cardBg} p={6} borderWidth={1} borderColor={cardBorder}>
        <Text fontWeight="bold" mb={4}>
          운영 및 문의
        </Text>
        <Text fontSize="sm" color={textMuted} mb={4}>
          서비스 관련 문의 및 이슈는 Slack DM / seonghan으로 연락해 주세요.
        </Text>
        <Text fontWeight="bold" mb={4}>
          운영 수칙
        </Text>
        <UnorderedList spacing={3} color={textMuted}>
          <ListItem>사물함은 개인 소지품 보관 용도로만 사용해 주세요.</ListItem>
          <ListItem>음식물 및 악취·오염 우려 물품의 보관은 금지됩니다.</ListItem>
          <ListItem>
            월 1회 이상 오프라인 점검을 진행하며, 점검 일정은 최소 3일 전에 공지합니다.
          </ListItem>
          <ListItem>
            무단 점유 또는 정책 위반이 확인될 경우 사물함은 즉시 회수되며 7일간 재대여가 제한될 수
            있습니다.
          </ListItem>
          <ListItem>정책 변경 사항이 있을 경우 운영진(seonghan)을 통해 공지됩니다.</ListItem>
        </UnorderedList>
      </Box>
    </Box>
  )
}
