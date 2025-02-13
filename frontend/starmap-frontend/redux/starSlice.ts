import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SelectedStarData, StarSystem } from '../types/starTypes'
import { TravelPlanItem } from '../types/travelTypes'

interface StarState {
  selectedStarData: SelectedStarData | null
  travelPlan: TravelPlanItem[]
}

const initialState: StarState = {
  selectedStarData: null,
  travelPlan: [],
}

const starSlice = createSlice({
  name: 'star',
  initialState,
  reducers: {
    setSelectedStarData(state, action: PayloadAction<{ star: StarSystem }>) {
      state.selectedStarData = action.payload;
    },
    clearSelectedStarData(state) {
      state.selectedStarData = null
    }
  },
})

export const {
  setSelectedStarData,
  clearSelectedStarData,
} = starSlice.actions

export default starSlice.reducer
