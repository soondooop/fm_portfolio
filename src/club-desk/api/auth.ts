import client, { authStorage } from './client'
import type { AuthSession, ClubUser } from '../../types/clubDesk'

const DEMO_EMAIL = 'manager@clubdesk.test'
const DEMO_PASSWORD = 'fm1234'

export interface LoginCredentials {
  email: string
  password: string
}

export class AuthFailedError extends Error {
  code = 'AUTH_FAILED'
}

export async function loginRequest({
  email,
  password,
}: LoginCredentials): Promise<AuthSession> {
  let user: ClubUser | null = null

  try {
    const { data } = await client.get('/users', {
      params: { email, password },
    })
    const list: ClubUser[] = Array.isArray(data) ? data : data?.data || []
    user = list[0] || null
  } catch {
    user = null
  }

  const ok: ClubUser | null =
    user ||
    (email === DEMO_EMAIL && password === DEMO_PASSWORD
      ? {
          id: 1,
          email: DEMO_EMAIL,
          name: 'Touchline Manager',
          club: 'North Pitch FC',
        }
      : null)

  if (!ok) {
    throw new AuthFailedError('이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  const safeUser: ClubUser = {
    id: ok.id,
    email: ok.email,
    name: ok.name,
    club: ok.club,
  }
  const token = `demo-token-${safeUser.id}`
  authStorage.setSession(token, safeUser)
  return { token, user: safeUser }
}

export function logoutRequest(): void {
  authStorage.clear()
}
