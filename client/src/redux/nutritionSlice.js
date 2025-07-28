import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  macrosByDate: {},
};

const formatDate = (date) => {
  if (typeof date === "string") return date;
  return date.toISOString().split("T")[0];
};

const nutritionSlice = createSlice({
  name: "nutrition",
  initialState,
  reducers: {
    setMacrosForDate(state, action) {
      const { date, macros } = action.payload;
      const formatted = formatDate(date);
      state.macrosByDate[formatted] = macros;
    },
    resetMacrosForDate(state, action) {
      const formatted = formatDate(action.payload);
      delete state.macrosByDate[formatted];
    },
    clearAllMacros(state) {
      state.macrosByDate = {};
    },
  },
});

export const { setMacrosForDate, resetMacrosForDate, clearAllMacros } =
  nutritionSlice.actions;

export const selectMacrosForDate = (state, date) => {
  const formatted = formatDate(date);
  return (
    state.nutrition.macrosByDate[formatted] || {
      protein: 0,
      carbs: 0,
      fats: 0,
      kcal: 0,
    }
  );
};

export default nutritionSlice.reducer;
