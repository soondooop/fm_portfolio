import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { loginRequest, logoutRequest } from '../../api/auth'
import type { LoginCredentials } from '../../api/auth'
import { authStorage } from '../../api/client'
import type { AuthSession, ClubUser } from '../../../types/clubDesk'

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface AuthState {
  user: ClubUser | null
  token: string | null
  status: AsyncStatus
  error: string | null
}

const savedUser = authStorage.getUser()
const savedToken = authStorage.getToken()

export const login = createAsyncThunk<AuthSession, LoginCredentials, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginRequest(credentials)
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.'
      return rejectWithValue(message)
    }
  },
)

const initialState: AuthState = {
  user: savedUser,
  token: savedToken,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      logoutRequest()
      state.user = null
      state.token = null
      state.status = 'idle'
      state.error = null
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthSession>) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || '로그인에 실패했습니다.'
      })
  },
})

export const { logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
