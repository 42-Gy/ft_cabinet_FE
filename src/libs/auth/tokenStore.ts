const ACCESS_TOKEN_KEY = 'subak_access_token'

const subscribers = new Set<(token: string | null) => void>()

const readInitialToken = () => {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch (error) {
    return null
  }
}

let accessToken: string | null = readInitialToken()

const notify = () => {
  subscribers.forEach((listener) => listener(accessToken))
}

const persist = () => {
  if (typeof window === 'undefined') return
  try {
    if (accessToken) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    } else {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  } catch (error) {
    // ignore storage failures
  }
}

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token
    persist()
    notify()
  },
  clear: () => {
    accessToken = null
    persist()
    notify()
  },
  subscribe: (listener: (token: string | null) => void) => {
    subscribers.add(listener)
    return () => subscribers.delete(listener)
  },
}
