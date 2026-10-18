import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  guideSectionLabels,
  lockerGuideSteps,
  type GuideSection,
} from '@/features/lockers/data/lockerGuide'

interface LockerGuideModalProps {
  section: GuideSection | 'all'
  onClose: () => void
  onComplete?: () => void
}

// Mount a new modal for each opening so revisiting help always starts at step one.
export const LockerGuideModal = ({ section, onClose, onComplete }: LockerGuideModalProps) => {
  const steps =
    section === 'all'
      ? lockerGuideSteps
      : lockerGuideSteps.filter((step) => step.section === section)
  const [stepIndex, setStepIndex] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const finishingRef = useRef(false)
  const step = steps[stepIndex]
  const isLastStep = stepIndex === steps.length - 1

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
    headingRef.current?.focus({ preventScroll: true })
  }, [stepIndex])

  return (
    <Modal
      isOpen
      onClose={onClose}
      size={{ base: 'full', md: '3xl' }}
      scrollBehavior="inside"
      initialFocusRef={headingRef}
    >
      <ModalOverlay />
      <ModalContent maxH={{ base: '100dvh', md: '92dvh' }} my={{ base: 0, md: 4 }}>
        <ModalHeader pr={12} pb={3}>
          {section === 'all' ? '대여 전 SUBAK 이용안내' : `${guideSectionLabels[section]} 도움말`}
          <Text fontSize="sm" fontWeight="normal" mt={1}>
            {section === 'all'
              ? '대여부터 반납까지, 시작 전에 확인해주세요.'
              : '사진과 함께 이용 방법을 확인하세요.'}
          </Text>
        </ModalHeader>
        <ModalCloseButton aria-label="이용안내 닫기" />
        <ModalBody ref={bodyRef} pb={5}>
          <Stack spacing={4}>
            <Box aria-live="polite" aria-atomic="true">
              <Badge colorScheme="brand" mb={2}>
                {guideSectionLabels[step.section]} · {stepIndex + 1} / {steps.length}
              </Badge>
              <Heading ref={headingRef} tabIndex={-1} size="md" outline="none">
                {step.title}
              </Heading>
            </Box>
            <Text>{step.description}</Text>
            {step.emphasis && (
              <Alert status="warning" borderRadius="lg" alignItems="flex-start">
                <AlertIcon />
                <Text fontWeight="bold">{step.emphasis}</Text>
              </Alert>
            )}
            {step.legend && (
              <Stack as="ul" spacing={2} listStyleType="none" m={0}>
                {step.legend.map((item) => (
                  <HStack as="li" key={item.label} align="start">
                    <Box bg={item.color} boxSize={3} mt={1.5} borderRadius="full" flexShrink={0} />
                    <Text>{item.label}</Text>
                  </HStack>
                ))}
              </Stack>
            )}
            {step.note && (
              <Text fontSize="sm" fontWeight="medium">
                {step.note}
              </Text>
            )}
            <SimpleGrid columns={{ base: 1, md: step.images.length }} spacing={4}>
              {step.images.map((picture) => (
                <Image
                  key={picture.src}
                  src={picture.src}
                  alt={picture.alt}
                  justifySelf="center"
                  w="full"
                  maxW="390px"
                  h="auto"
                  objectFit="contain"
                  borderRadius="lg"
                  borderWidth={1}
                  borderColor="gray.200"
                />
              ))}
            </SimpleGrid>
          </Stack>
        </ModalBody>
        <ModalFooter
          borderTopWidth={1}
          gap={2}
          px={{ base: 4, md: 6 }}
          pb="max(1rem, env(safe-area-inset-bottom))"
        >
          <Button variant="ghost" px={{ base: 3, md: 4 }} minH="44px" onClick={onClose}>
            닫기
          </Button>
          <Button
            variant="outline"
            px={{ base: 3, md: 4 }}
            minH="44px"
            isDisabled={stepIndex === 0}
            onClick={() => setStepIndex((index) => index - 1)}
          >
            이전
          </Button>
          <Button
            colorScheme="brand"
            flex={{ base: 1, md: 'initial' }}
            minW={0}
            minH="44px"
            h="auto"
            py={2}
            whiteSpace="normal"
            fontSize={{ base: 'sm', md: 'md' }}
            onClick={() => {
              if (!isLastStep) {
                setStepIndex((index) => index + 1)
              } else if (!finishingRef.current) {
                finishingRef.current = true
                if (onComplete) onComplete()
                else onClose()
              }
            }}
          >
            {isLastStep ? (onComplete ? '안내 확인 후 대여하기' : '안내 확인') : '다음'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
