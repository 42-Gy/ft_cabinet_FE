import axios, { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/libs/env'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
  },
  withCredentials: true,
  timeout: 8000,
})

export const publicClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
  },
})

const reissueClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers = AxiosHeaders.from(config.headers ?? {})
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    headers.delete('Content-Type')
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  config.headers = headers
  return config
})

let refreshPromise: Promise<boolean | null> | null = null

const reissueAccessToken = async () => {
  await reissueClient.post('/v4/auth/reissue')
  return true
}

const enqueueRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = reissueAccessToken()
      .then(() => true)
      .catch((error) => {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('[API] token refresh failed', error)
        }
        if (typeof window !== 'undefined') {
          window.location.assign('/')
        }
        return null
      })
      .finally(() => {
        // allow future refresh attempts
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const { response, config } = error
    const originalRequest = config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    const skipReissue =
      Boolean(originalRequest?.headers && 'X-Skip-Reissue' in originalRequest.headers)

    if (response?.status === 401 && originalRequest && !originalRequest._retry && !skipReissue) {
      originalRequest._retry = true
      const newToken = await enqueueRefresh()
      if (newToken) {
        return apiClient(originalRequest)
      }
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[API]', error)
    }
    return Promise.reject(error)
  },
)
