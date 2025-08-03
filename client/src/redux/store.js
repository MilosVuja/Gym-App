import { configureStore } from '@reduxjs/toolkit';
import mealsReducer from './mealsSlice';
import macrosReducer from "./macrosSlice";
import favoritesReducer from "./favoritesSlice";
import nutritionReducer from "./nutritionSlice";

export const store = configureStore({
  reducer: {
    meals: mealsReducer,
    macros: macrosReducer,
    favorites: favoritesReducer,
    nutrition: nutritionReducer,
  },
});
