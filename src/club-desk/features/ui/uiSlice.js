import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    modal: { open: false, mode: 'create', playerId: null },
    toast: { message: '', type: 'info', visible: false },
  },
  reducers: {
    openModal(state, action) {
      state.modal = {
        open: true,
        mode: action.payload.mode || 'create',
        playerId: action.payload.playerId ?? null,
      }
    },
    closeModal(state) {
      state.modal = { open: false, mode: 'create', playerId: null }
    },
    showToast(state, action) {
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
