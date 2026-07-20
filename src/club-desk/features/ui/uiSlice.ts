import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { SquadPlayer } from '../../../types/clubDesk'

export type ModalMode = 'create' | 'edit'
export type ToastType = 'info' | 'success' | 'error'

export interface ModalState {
  open: boolean
  mode: ModalMode
  playerId: SquadPlayer['id'] | null
}

export interface ToastState {
  message: string
  type: ToastType
  visible: boolean
}

export interface UiState {
  modal: ModalState
  toast: ToastState
}

export interface OpenModalPayload {
  mode?: ModalMode
  playerId?: SquadPlayer['id'] | null
}

export interface ShowToastPayload {
  message: string
  type?: ToastType
}

const initialState: UiState = {
  modal: { open: false, mode: 'create', playerId: null },
  toast: { message: '', type: 'info', visible: false },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<OpenModalPayload>) {
      state.modal = {
        open: true,
        mode: action.payload.mode || 'create',
        playerId: action.payload.playerId ?? null,
      }
    },
    closeModal(state) {
      state.modal = { open: false, mode: 'create', playerId: null }
    },
    showToast(state, action: PayloadAction<ShowToastPayload>) {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        visible: true,
      }
    },
    hideToast(state) {
      state.toast.visible = false
      state.toast.message = ''
    },
  },
})

export const { openModal, closeModal, showToast, hideToast } = uiSlice.actions
export default uiSlice.reducer
