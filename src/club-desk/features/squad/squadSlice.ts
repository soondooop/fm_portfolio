import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  createPlayer,
  deletePlayer,
  deletePlayers,
  fetchPlayers,
  updatePlayer,
} from '../../api/players'
import { showToast } from '../ui/uiSlice'
import type { ModalMode } from '../ui/uiSlice'
import { clearPlayers } from '../selection/selectionSlice'
import type { PaginatedResult, PlayerInput, SquadPlayer, SquadQuery } from '../../../types/clubDesk'
import type { AppDispatch, RootState } from '../../app/store'

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface SquadState {
  players: SquadPlayer[]
  total: number
  status: AsyncStatus
  error: string | null
  query: SquadQuery
}

export const loadPlayers = createAsyncThunk<
  PaginatedResult<SquadPlayer>,
  void,
  { state: RootState; rejectValue: string }
>('squad/loadPlayers', async (_, { getState, rejectWithValue }) => {
  try {
    const { query } = getState().squad
    return await fetchPlayers(query)
  } catch {
    return rejectWithValue('스쿼드 목록을 불러오지 못했습니다.')
  }
})

export interface SavePlayerArgs {
  mode: ModalMode
  id: SquadPlayer['id'] | null
  payload: PlayerInput
}

export const savePlayer = createAsyncThunk<
  void,
  SavePlayerArgs,
  { dispatch: AppDispatch; rejectValue: string }
>('squad/savePlayer', async ({ mode, id, payload }, { dispatch, rejectWithValue }) => {
  try {
    if (mode === 'edit' && id !== null) {
      await updatePlayer(id, payload)
      dispatch(showToast({ message: '선수 정보가 수정되었습니다.', type: 'success' }))
    } else {
      await createPlayer(payload)
      dispatch(showToast({ message: '선수가 등록되었습니다.', type: 'success' }))
    }
    await dispatch(loadPlayers())
  } catch {
    dispatch(showToast({ message: '저장에 실패했습니다.', type: 'error' }))
    return rejectWithValue('저장 실패')
  }
})

export const removePlayer = createAsyncThunk<
  void,
  SquadPlayer['id'],
  { dispatch: AppDispatch; rejectValue: string }
>('squad/removePlayer', async (id, { dispatch, rejectWithValue }) => {
  try {
    await deletePlayer(id)
    dispatch(showToast({ message: '선수를 방출했습니다.', type: 'success' }))
    await dispatch(loadPlayers())
  } catch {
    dispatch(showToast({ message: '방출에 실패했습니다.', type: 'error' }))
    return rejectWithValue('삭제 실패')
  }
})

export const removeSelectedPlayers = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('squad/removeSelectedPlayers', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const ids = getState().selection.selectedPlayerIds
    if (!ids.length) return
    await deletePlayers(ids)
    dispatch(clearPlayers())
    dispatch(
      showToast({
        message: `${ids.length}명을 일괄 방출했습니다.`,
        type: 'success',
      }),
    )
    await dispatch(loadPlayers())
  } catch {
    dispatch(showToast({ message: '일괄 방출에 실패했습니다.', type: 'error' }))
    return rejectWithValue('일괄 삭제 실패')
  }
})

const initialState: SquadState = {
  players: [],
  total: 0,
  status: 'idle',
  error: null,
  query: {
    page: 1,
    limit: 8,
    q: '',
    position: '',
    status: '',
  },
}

const squadSlice = createSlice({
  name: 'squad',
  initialState,
  reducers: {
    setSquadQuery(state, action: PayloadAction<Partial<SquadQuery>>) {
      state.query = { ...state.query, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPlayers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadPlayers.fulfilled, (state, action: PayloadAction<PaginatedResult<SquadPlayer>>) => {
        state.status = 'succeeded'
        state.players = action.payload.list
        state.total = action.payload.total
      })
      .addCase(loadPlayers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || '오류가 발생했습니다.'
      })
  },
})

export const { setSquadQuery } = squadSlice.actions
export default squadSlice.reducer
