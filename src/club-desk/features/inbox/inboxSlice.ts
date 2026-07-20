import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  bulkRespondOffers,
  fetchOffers,
  respondOffer,
} from '../../api/offers'
import { showToast } from '../ui/uiSlice'
import { clearOffers } from '../selection/selectionSlice'
import type { InboxQuery, Offer, OfferStatus, PaginatedResult } from '../../../types/clubDesk'
import type { AppDispatch, RootState } from '../../app/store'

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface InboxState {
  offers: Offer[]
  total: number
  status: AsyncStatus
  error: string | null
  query: InboxQuery
}

export const loadOffers = createAsyncThunk<
  PaginatedResult<Offer>,
  void,
  { state: RootState; rejectValue: string }
>('inbox/loadOffers', async (_, { getState, rejectWithValue }) => {
  try {
    const { query } = getState().inbox
    return await fetchOffers(query)
  } catch {
    return rejectWithValue('인박스 목록을 불러오지 못했습니다.')
  }
})

export interface RespondToOfferArgs {
  id: Offer['id']
  status: OfferStatus
}

export const respondToOffer = createAsyncThunk<
  void,
  RespondToOfferArgs,
  { dispatch: AppDispatch; rejectValue: string }
>('inbox/respondToOffer', async ({ id, status }, { dispatch, rejectWithValue }) => {
  try {
    await respondOffer(id, status)
    const label = status === 'accepted' ? '수락' : '거절'
    dispatch(showToast({ message: `제안을 ${label}했습니다.`, type: 'success' }))
    await dispatch(loadOffers())
  } catch {
    dispatch(showToast({ message: '제안 처리에 실패했습니다.', type: 'error' }))
    return rejectWithValue('제안 처리 실패')
  }
})

export const bulkRejectOffers = createAsyncThunk<
  void,
  void,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>('inbox/bulkRejectOffers', async (_, { dispatch, getState, rejectWithValue }) => {
  try {
    const ids = getState().selection.selectedOfferIds
    if (!ids.length) return
    await bulkRespondOffers(ids, 'rejected')
    dispatch(clearOffers())
    dispatch(
      showToast({
        message: `${ids.length}건을 일괄 거절했습니다.`,
        type: 'success',
      }),
    )
    await dispatch(loadOffers())
  } catch {
    dispatch(showToast({ message: '일괄 거절에 실패했습니다.', type: 'error' }))
    return rejectWithValue('일괄 거절 실패')
  }
})

const initialState: InboxState = {
  offers: [],
  total: 0,
  status: 'idle',
  error: null,
  query: {
    page: 1,
    limit: 8,
    status: '',
    type: '',
  },
}

const inboxSlice = createSlice({
  name: 'inbox',
  initialState,
  reducers: {
    setInboxQuery(state, action: PayloadAction<Partial<InboxQuery>>) {
      state.query = { ...state.query, ...action.payload }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOffers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadOffers.fulfilled, (state, action: PayloadAction<PaginatedResult<Offer>>) => {
        state.status = 'succeeded'
        state.offers = action.payload.list
        state.total = action.payload.total
      })
      .addCase(loadOffers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || '오류가 발생했습니다.'
      })
  },
})

export const { setInboxQuery } = inboxSlice.actions
export default inboxSlice.reducer
