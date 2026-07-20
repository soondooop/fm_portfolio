import { createSlice } from '@reduxjs/toolkit'

const selectionSlice = createSlice({
  name: 'selection',
  initialState: {
    selectedPlayerIds: [],
    selectedOfferIds: [],
  },
  reducers: {
    togglePlayer(state, action) {
      const id = action.payload
      if (state.selectedPlayerIds.includes(id)) {
        state.selectedPlayerIds = state.selectedPlayerIds.filter((x) => x !== id)
      } else {
        state.selectedPlayerIds.push(id)
      }
    },
    setPlayers(state, action) {
      state.selectedPlayerIds = action.payload
    },
    clearPlayers(state) {
      state.selectedPlayerIds = []
    },
    toggleOffer(state, action) {
      const id = action.payload
      if (state.selectedOfferIds.includes(id)) {
        state.selectedOfferIds = state.selectedOfferIds.filter((x) => x !== id)
      } else {
        state.selectedOfferIds.push(id)
      }
    },
    setOffers(state, action) {
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
