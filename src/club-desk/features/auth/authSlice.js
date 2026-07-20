import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { loginRequest, logoutRequest } from '../../api/auth'
import { authStorage } from '../../api/client'

const savedUser = authStorage.getUser()
const savedToken = authStorage.getToken()

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginRequest(credentials)
    } catch (error) {
      return rejectWithValue(error.message || '로그인에 실패했습니다.')
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    token: savedToken,
    status: 'idle',
    error: null,
  },
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
      .addCase(login.fulfilled, (state, action) => {
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
