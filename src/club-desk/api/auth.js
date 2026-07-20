import client, { authStorage } from './client'

const DEMO_EMAIL = 'manager@clubdesk.test'
const DEMO_PASSWORD = 'fm1234'

export async function loginRequest({ email, password }) {
  let user = null

  try {
    const { data } = await client.get('/users', {
      params: { email, password },
    })
    const list = Array.isArray(data) ? data : data?.data || []
    user = list[0] || null
  } catch {
    user = null
  }

  const ok =
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
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
    err.code = 'AUTH_FAILED'
    throw err
  }

  const safeUser = {
    id: ok.id,
    email: ok.email,
    name: ok.name,
    club: ok.club,
  }
  const token = `demo-token-${safeUser.id}`
  authStorage.setSession(token, safeUser)
  return { token, user: safeUser }
}

export function logoutRequest() {
  authStorage.clear()
}
