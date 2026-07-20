import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Offer, SquadPlayer } from '../../../types/clubDesk'

export interface SelectionState {
  selectedPlayerIds: Array<SquadPlayer['id']>
  selectedOfferIds: Array<Offer['id']>
}

const initialState: SelectionState = {
  selectedPlayerIds: [],
  selectedOfferIds: [],
}

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    togglePlayer(state, action: PayloadAction<SquadPlayer['id']>) {
      const id = action.payload
      if (state.selectedPlayerIds.includes(id)) {
        state.selectedPlayerIds = state.selectedPlayerIds.filter((x) => x !== id)
      } else {
        state.selectedPlayerIds.push(id)
      }
    },
    setPlayers(state, action: PayloadAction<Array<SquadPlayer['id']>>) {
      state.selectedPlayerIds = action.payload
    },
    clearPlayers(state) {
      state.selectedPlayerIds = []
    },
    toggleOffer(state, action: PayloadAction<Offer['id']>) {
      const id = action.payload
      if (state.selectedOfferIds.includes(id)) {
        state.selectedOfferIds = state.selectedOfferIds.filter((x) => x !== id)
      } else {
        state.selectedOfferIds.push(id)
      }
    },
    setOffers(state, action: PayloadAction<Array<Offer['id']>>) {
      state.selectedOfferIds = action.payload
    },
    clearOffers(state) {
      state.selectedOfferIds = []
    },
  },
})

export const {
  togglePlayer,
  setPlayers,
  clearPlayers,
  toggleOffer,
  setOffers,
  clearOffers,
} = selectionSlice.actions

export default selectionSlice.reducer
