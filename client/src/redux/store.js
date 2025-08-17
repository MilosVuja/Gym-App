import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import mealsReducer from "./mealsSlice";
import macrosReducer from "./macrosSlice";
import favoritesReducer from "./favoritesSlice";
import nutritionReducer from "./nutritionSlice";

const persistConfig = {
  key: "nutrition",
  storage,
  whitelist: [
    "personalInfo",
    "appliedCustomMacros",
    "assignedPlanByDay",
    "periodStartDate",
    "periodEndDate",
  ],
};

const rootReducer = combineReducers({
  meals: mealsReducer,
  macros: macrosReducer,
  favorites: favoritesReducer,
  nutrition: persistReducer(persistConfig, nutritionReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
