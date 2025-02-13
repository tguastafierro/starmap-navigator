import { configureStore } from '@reduxjs/toolkit';
import starReducer from './starSlice';
import travelReducer from './travelSlice';

export const store = configureStore({
  reducer: {
    star: starReducer,     
    travel: travelReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;