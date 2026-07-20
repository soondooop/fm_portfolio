import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import squadReducer from '../features/squad/squadSlice'
import inboxReducer from '../features/inbox/inboxSlice'
import selectionReducer from '../features/selection/selectionSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    squad: squadReducer,
    inbox: inboxReducer,
    selection: selectionReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
