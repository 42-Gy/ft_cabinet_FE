const booleanFromEnv = (value: string | undefined, fallback = false) => {
  if (value === undefined) return fallback
  return value.toLowerCase() === 'true'
}

const fallback = {
  apiBaseUrl: 'https://unforbearing-peter-nonvicariously.ngrok-free.dev',
  authBaseUrl: 'https://unforbearing-peter-nonvicariously.ngrok-free.dev',
  policyEmail: '010-5196-1565',
  policyContact: '한성익',
  policyUpdatedAt: '2025-12-01',
  policySummary:
    '사물함은 1인 1개만 대여 가능하며, 장기 미사용 시 자동 회수됩니다. 파손/분실 시 즉시 운영진에게 보고해 주세요.',
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? fallback.apiBaseUrl,
  authBaseUrl: import.meta.env.VITE_AUTH_BASE_URL ?? fallback.authBaseUrl,
  policyEmail: import.meta.env.VITE_POLICY_EMAIL ?? fallback.policyEmail,
  policyContact: import.meta.env.VITE_POLICY_CONTACT ?? fallback.policyContact,
  policyUpdatedAt: import.meta.env.VITE_POLICY_UPDATED_AT ?? fallback.policyUpdatedAt,
  policySummary: import.meta.env.VITE_POLICY_SUMMARY ?? fallback.policySummary,
  useMockApi: booleanFromEnv(import.meta.env.VITE_USE_MOCK, import.meta.env.DEV),
  serviceName: import.meta.env.VITE_SERVICE_NAME ?? 'SUBAK',
}
