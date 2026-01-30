import { extendTheme, type StyleFunctionProps, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#fff6f4',
    100: '#ffe0e0',
    200: '#ffc4c6',
    300: '#ff9ba0',
    400: '#ff7a86',
    500: '#ff5a6d', // 수박 과육 레드
    600: '#e04458',
    700: '#b73045',
    800: '#7c1f2e',
    900: '#3d0e17',
  },
  leaf: {
    50: '#edfdf5',
    100: '#d2f5e2',
    200: '#a5ebc6',
    300: '#72dfab',
    400: '#44d392',
    500: '#2ab675',
    600: '#1f905b',
    700: '#186f47',
    800: '#0f4a30',
    900: '#082a1c',
  },
}

export const theme = extendTheme({
  config,
  colors,
  semanticTokens: {
    colors: {
      'brand.50': { default: 'brand.50', _dark: 'blue.50' },
      'brand.100': { default: 'brand.100', _dark: 'blue.100' },
      'brand.200': { default: 'brand.200', _dark: 'blue.200' },
      'brand.300': { default: 'brand.300', _dark: 'blue.300' },
      'brand.400': { default: 'brand.400', _dark: 'blue.400' },
      'brand.500': { default: 'brand.500', _dark: 'blue.500' },
      'brand.600': { default: 'brand.600', _dark: 'blue.600' },
      'brand.700': { default: 'brand.700', _dark: 'blue.700' },
      'brand.800': { default: 'brand.800', _dark: 'blue.800' },
      'brand.900': { default: 'brand.900', _dark: 'blue.900' },
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: props.colorMode === 'dark' ? '#0f1b1b' : '#fdf9f5',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
      },
    }),
  },
  fonts: {
    heading:
      "'BMJUA', 'Pretendard Variable', 'Spoqa Han Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body:
      "'BMJUA', 'Pretendard Variable', 'Spoqa Han Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: { bg: 'brand.400' },
          _active: { bg: 'brand.600' },
        },
      },
    },
  },
})
