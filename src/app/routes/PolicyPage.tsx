import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  ListItem,
  Link,
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
        '사물함은 인당 1개만 대여 가능합니다. 사물함 이용기간 만료 7일전 1일전 Slack을 통해 알림이 발송됩니다. 파손 또는 분실이 발생한 경우 즉시 운영진에게 신고해 주세요.',
    },
    {
      title: '대여 기간',
      description:
        '대여권의 기본 사용 기간은 31일이며, 대여권은 최대 1개까지 보유할 수 있습니다. 대여권 만료 시점은 내 사물함 페이지에서 확인할 수 있으며, 운영 수칙에 위배된 경우 회수 절차가 진행될 수 있습니다.',
    },
    {
      title: '연장권 사용 규칙',
      description:
        '연장권은 월 최대 5회 구매/사용 가능하며, 보유 개수도 최대 5개까지 가능합니다. 사물함 수요에 따라 연장권 사용이 제한될 수 있습니다.',
    },
  ]

  return (
    <Box>
      <PageHeader title="이용약관" description={`최종 업데이트: ${env.policyUpdatedAt}`} />
      <Text fontSize="sm" color={textMuted} textAlign="right" mb={4}>
        최종 업데이트: {env.policyUpdatedAt}
      </Text>

      <Alert status="info" borderRadius="lg" mb={6}>
        <AlertIcon />
        <AlertDescription>
          SUBAK 사물함은 42경산 카뎃을 위한 공유 자산으로, 원활한 이용을 위해 아래 운영 정책을
          따릅니다.
        </AlertDescription>
      </Alert>

      <Text fontWeight="bold" mb={4}>
        운영 정책
      </Text>
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
          사물함 고장 신고는 Slack 채널 staff_facility_building으로 신고해 주세요.
        </Text>
        <Text fontWeight="bold" mb={4}>
          운영 수칙
        </Text>
        <UnorderedList spacing={3} color={textMuted}>
          <ListItem>사물함은 개인 소지품 보관 용도로만 사용해 주세요.</ListItem>
          <ListItem>음식물 및 악취 오염 우려 물품의 보관은 금지됩니다.</ListItem>
          <ListItem>
            무단 점유 또는 정책 위반이 확인될 경우 사물함은 회수 될 수 있으며 운영정책에 따라서
            이용이 제한될 수 있습니다.
          </ListItem>
          <ListItem>정책 변경 사항이 있을 경우 운영진(seonghan)을 통해 공지됩니다.</ListItem>
        </UnorderedList>
        <Text fontSize="sm" color={textMuted} mt={4}>
          자세한 운영수칙 보러가기:{' '}
          <Link
            href="https://first-hyssop-363.notion.site/SUBAK-Ver-1-f5d3a5fdea39834c9b308151ef0767de?source=copy_link"
            color="brand.500"
            isExternal
          >
            Notion 링크
          </Link>
        </Text>
      </Box>
    </Box>
  )
}
