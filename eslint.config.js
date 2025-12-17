import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['dist', 'node_modules', '.npm-cache'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      prettierConfig,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['src/app/routes/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'recoil', message: 'pages 레이어에서는 recoil을 직접 import 하지 않습니다.' },
          ],
          patterns: [
            {
              group: ['@/features/*/api/*', '@/features/*/state/*', '@/features/*/recoil/*', '@/libs/axios/*'],
              message: 'pages → hooks → api 순서를 지키고, API/axios는 hook이나 lib에서만 사용하세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/features/**/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'recoil', message: 'UI 컴포넌트는 recoil을 직접 다루지 않습니다. hook을 통해 전달하세요.' },
            { name: 'axios', message: 'UI 컴포넌트는 axios를 직접 호출하지 않습니다.' },
          ],
          patterns: [
            {
              group: ['@/features/*/api/*', '@/features/*/state/*', '@/features/*/recoil/*', '@/libs/axios/*'],
              message: '컴포넌트는 데이터 계층에 직접 의존하지 말고 props/hook을 사용하세요.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'react', message: 'API 계층은 React에 의존하지 않습니다.' },
            { name: 'recoil', message: 'API 계층에서 recoil을 import 하지 않습니다.' },
          ],
          patterns: [
            {
              group: ['@/features/*/hooks/*', '@/features/*/state/*'],
              message: 'API 파일에는 hook/state 를 import 하지 않습니다.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/state/**/*.{ts,tsx}', 'src/**/recoil/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'axios', message: 'Recoil 상태 정의에서는 API 호출/axios를 사용하지 않습니다.' },
          ],
          patterns: [
            {
              group: ['@/features/*/api/*', '@/libs/axios/*'],
              message: 'Recoil 상태는 순수 상태 정의만 포함해야 합니다.',
            },
          ],
        },
      ],
    },
  },
])
