import axios from 'axios'
import type { ClubUser } from '../../types/clubDesk'

const TOKEN_KEY = 'clubdesk_token'
const USER_KEY = 'clubdesk_user'

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: (): ClubUser | null => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as ClubUser) : null
  },
  setSession: (token: string, user: ClubUser): void => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      authStorage.clear()
    }
    return Promise.reject(error)
  },
)

export default client
