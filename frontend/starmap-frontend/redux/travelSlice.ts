import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TravelPlanItem } from '../types/travelTypes';

interface TravelState {
  travelPlan: TravelPlanItem[];
}

const initialState: TravelState = {
  travelPlan: [],
};

const travelSlice = createSlice({
  name: 'travel',
  initialState,
  reducers: {
    addTravelPlanItem(state, action: PayloadAction<TravelPlanItem>) {
      if (!state.travelPlan.some(item => item.id === action.payload.id)) {
        state.travelPlan = [...state.travelPlan, action.payload];
      }
    },
    removeTravelPlanItem(state, action: PayloadAction<string>) {
      state.travelPlan = state.travelPlan.filter(item => item.id !== action.payload);
    },
    clearTravelPlan(state) {
      state.travelPlan = [];
    },
  },
});

export const { addTravelPlanItem, removeTravelPlanItem, clearTravelPlan } = travelSlice.actions;
export default travelSlice.reducer;
