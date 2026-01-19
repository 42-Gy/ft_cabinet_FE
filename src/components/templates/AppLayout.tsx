import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Link as RouterLink, NavLink, Outlet } from 'react-router-dom'
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi'
import { FiMoon, FiSun } from 'react-icons/fi'
import { env } from '@/libs/env'
import { useAuthSession } from '@/features/auth/hooks/useAuthSession'

const routes = [
  { to: '/lockers', label: 'Lockers' },
  { to: '/my/lockers', label: 'My Lockers' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/store', label: 'Store' },
  { to: '/admin', label: 'Admin' },
  { to: '/policy', label: 'Policy' },
]

export const AppLayout = () => {
  const { isOpen, onToggle, onClose } = useDisclosure()
  const { isAuthenticated, logout } = useAuthSession()
  const { colorMode, toggleColorMode } = useColorMode()
  const headerBg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.100', 'whiteAlpha.200')
  const linkColor = useColorModeValue('gray.600', 'gray.300')
  const activeLinkColor = useColorModeValue('brand.600', 'leaf.200')
  const hoverColor = useColorModeValue('leaf.500', 'leaf.200')
  const mainBg = useColorModeValue('#fdf9f5', '#111')

  const handleLogin = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `${env.authBaseUrl}/oauth2/authorization/42`
    }
  }

  const isLoggedIn = isAuthenticated

  const renderLinks = (direction: 'row' | 'column') => (
    <Stack
      spacing={direction === 'row' ? 6 : 4}
      direction={direction}
      align={direction === 'row' ? 'center' : 'flex-start'}
    >
      {routes.map((route) => (
        <Link
          key={route.to}
          as={NavLink}
          to={route.to}
          onClick={onClose}
          fontWeight="medium"
          color={linkColor}
          _hover={{ color: hoverColor }}
          _activeLink={{ color: activeLinkColor }}
        >
          {route.label}
        </Link>
      ))}
    </Stack>
  )

  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" bg={headerBg} borderBottomWidth={1} borderColor={borderColor} position="sticky" top={0} zIndex={10}>
        <Flex align="center" justify="flex-start" maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={4} gap={4}>
          <Link
            as={RouterLink}
            to="/"
            display="inline-flex"
            alignItems="center"
            gap={3}
            textDecoration="none"
            _hover={{ textDecoration: 'none' }}
          >
            <Image
              src="/assets/images/subak_log.png"
              alt="SUBAK 로고"
              boxSize={{ base: 10, md: 12 }}
              borderRadius="full"
            />
            <Stack spacing={0} align="flex-start">
              <Text fontWeight="black" fontSize="xl" color="brand.600">
                {env.serviceName}
              </Text>
              <Text fontSize="xs" color="leaf.500" fontWeight="medium">
                Safe Under Beside you, Always Keeping
              </Text>
            </Stack>
          </Link>
          <Flex align="center" gap={4} display={{ base: 'none', md: 'flex' }} ml="auto">
            {renderLinks('row')}
            <Button size="sm" colorScheme="brand" variant={isLoggedIn ? 'outline' : 'solid'} onClick={isLoggedIn ? logout : handleLogin}>
              {isLoggedIn ? '로그아웃' : '로그인'}
            </Button>
            <IconButton
              aria-label={colorMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              variant="ghost"
              color={colorMode === 'light' ? 'brand.600' : 'leaf.200'}
              onClick={toggleColorMode}
            />
          </Flex>
          <IconButton
            aria-label="메뉴 열기"
            icon={isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
            onClick={onToggle}
            variant="ghost"
            display={{ base: 'flex', md: 'none' }}
            ml="auto"
          />
        </Flex>
        {isOpen && (
          <Box px={4} pb={4}>
            <IconButton
              aria-label={colorMode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              variant="ghost"
              color={colorMode === 'light' ? 'brand.600' : 'leaf.200'}
              onClick={toggleColorMode}
              mb={3}
              ml="auto"
            />
            {renderLinks('column')}
            <Button
              mt={4}
              w="full"
              colorScheme="brand"
              variant={isLoggedIn ? 'outline' : 'solid'}
              onClick={() => {
                onClose()
                if (isLoggedIn) logout()
                else handleLogin()
              }}
            >
              {isLoggedIn ? '로그아웃' : '로그인'}
            </Button>
          </Box>
        )}
      </Box>
      <Box as="main" flex={1} w="full" bg={mainBg}>
        <Box mx="auto" maxW="1200px" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}
