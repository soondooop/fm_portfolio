import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearAuthError, login } from '../features/auth/authSlice'

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const { token, status, error } = useAppSelector((s) => s.auth)
  const [email, setEmail] = useState('manager@clubdesk.test')
  const [password, setPassword] = useState('fm1234')

  if (token) {
    return <Navigate to="/club-desk/squad" replace />
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(clearAuthError())
    dispatch(login({ email, password }))
  }

  return (
    <div className="cd-login">
      <form className="cd-login__card" onSubmit={onSubmit}>
        <p className="cd-eyebrow">Club Desk</p>
        <h1>구단 운영 로그인</h1>
        <p className="cd-login__hint">
          데모 계정: manager@clubdesk.test / fm1234
        </p>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? <p className="cd-error">{error}</p> : null}

        <button
          type="submit"
          className="cd-btn cd-btn--primary"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? '입장 중…' : 'Touchline 입장'}
        </button>

        <Link className="cd-login__back" to="/">
          ← 포트폴리오(스카우트 리포트)로
        </Link>
      </form>
    </div>
  )
}
