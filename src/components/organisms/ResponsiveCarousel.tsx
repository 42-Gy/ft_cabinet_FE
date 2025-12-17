import { Box, Button, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { IoChevronBack, IoChevronForward } from 'react-icons/io5'

interface CarouselSlide {
  id: string
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
  ctaOnClick?: () => void
}

interface ResponsiveCarouselProps {
  slides: CarouselSlide[]
  autoPlayInterval?: number
}

export const ResponsiveCarousel = ({ slides, autoPlayInterval = 6000 }: ResponsiveCarouselProps) => {
  const [current, setCurrent] = useState(0)
  const safeSlides = useMemo(
    () => slides.filter((slide): slide is CarouselSlide => Boolean(slide)),
    [slides],
  )

  useEffect(() => {
    if (safeSlides.length <= 1) return undefined
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % safeSlides.length)
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [autoPlayInterval, safeSlides.length])

  if (safeSlides.length === 0) {
    return null
  }

  const onNext = () => setCurrent((prev) => (prev + 1) % safeSlides.length)
  const onPrev = () => setCurrent((prev) => (prev - 1 + safeSlides.length) % safeSlides.length)

  const slide = safeSlides[current]

  return (
    <Box
      position="relative"
      w="full"
      overflow="hidden"
      borderRadius="2xl"
      bgGradient="linear(to-r, brand.500, leaf.500)"
      color="white"
      p={{ base: 6, md: 12 }}
    >
      <Stack spacing={4} maxW="3xl">
        <Text fontSize="xs" letterSpacing={1.5} textTransform="uppercase" color="whiteAlpha.800">
          SUBAK Stories
        </Text>
        <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight="black">
          {slide.title}
        </Text>
        <Text fontSize={{ base: 'md', md: 'lg' }} opacity={0.9}>
          {slide.description}
        </Text>
        {slide.ctaLabel && (
          <Button
            as={slide.ctaHref ? 'a' : undefined}
            href={slide.ctaHref ?? undefined}
            onClick={slide.ctaOnClick}
            colorScheme="brand"
            size="lg"
            alignSelf="flex-start"
          >
            {slide.ctaLabel}
          </Button>
        )}
      </Stack>
      {safeSlides.length > 1 && (
        <HStack justify="space-between" mt={8}>
          <HStack spacing={2}>
            {safeSlides.map((item, index) => (
              <Box
                key={item.id}
                w={index === current ? 10 : 6}
                h={1.5}
                borderRadius="full"
                bg={index === current ? 'white' : 'whiteAlpha.500'}
                transition="all 0.2s"
              />
            ))}
          </HStack>
          <HStack spacing={2}>
            <IconButton aria-label="Prev" icon={<IoChevronBack />} onClick={onPrev} variant="ghost" colorScheme="whiteAlpha" />
            <IconButton aria-label="Next" icon={<IoChevronForward />} onClick={onNext} variant="ghost" colorScheme="whiteAlpha" />
          </HStack>
        </HStack>
      )}
    </Box>
  )
}
