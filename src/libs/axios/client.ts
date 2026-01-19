import axios, { AxiosError, AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { tokenStore } from '@/libs/auth/tokenStore'
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
  const token = tokenStore.get()
  if (token) {
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    config.headers = headers
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

const reissueAccessToken = async () => {
  const { data } = await reissueClient.post<{ accessToken: string }>('/v4/auth/reissue')
  return data.accessToken
}

const enqueueRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = reissueAccessToken()
      .then((newToken) => {
        tokenStore.set(newToken)
        return newToken
      })
      .catch((error) => {
        tokenStore.clear()
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

    if (response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      const newToken = await enqueueRefresh()
      if (newToken) {
        const headers = AxiosHeaders.from(originalRequest.headers ?? {})
        headers.set('Authorization', `Bearer ${newToken}`)
        originalRequest.headers = headers
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
