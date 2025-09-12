import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import trainingReducer from "../features/trainingPlanner/trainingSlice";
import nutritionReducer from "../features/nutritionPlanner/nutritionSlice";
import macrosReducer from "../features/nutritionPlanner/macrosSlice";
import mealsReducer from "../features/mealPlanner/mealsSlice";
import favoritesReducer from "../features/favorites/favoritesSlice";

const nutritionPersistConfig = {
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

const trainingPersistConfig = {
  key: "training",
  storage,
  whitelist: [
    "name",
    "description",
    "duration",
    "timesPerWeek",
    "startDate",
    "savedDays",
    "selectedMuscles",
    "filledMuscles",
    "filters",
  ],

};

const rootReducer = combineReducers({
  training: persistReducer(trainingPersistConfig, trainingReducer),
  meals: mealsReducer,
  macros: macrosReducer,
  favorites: favoritesReducer,
  nutrition: persistReducer(nutritionPersistConfig, nutritionReducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE', 
          'persist/REGISTER'
        ],
        ignoredPaths: [
          'register', 
          'rehydrate',
          'training.filledMuscles'
        ],
      },
    }),
});

export const persistor = persistStore(store);