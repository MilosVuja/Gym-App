import { configureStore } from '@reduxjs/toolkit';
import mealsReducer from './mealsSlice';
import macrosReducer from "./macrosSlice";

export const store = configureStore({
  reducer: {
    meals: mealsReducer,
    macros: macrosReducer,
  },
});
