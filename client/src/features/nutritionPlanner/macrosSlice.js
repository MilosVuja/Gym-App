import { createSlice } from "@reduxjs/toolkit";

const macrosSlice = createSlice({
  name: "macros",
  initialState: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  reducers: {
    setMacros: (state, action) => {
      return action.payload;
    },
    resetMacros: () => ({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }),
  },
});

export const { setMacros, resetMacros } = macrosSlice.actions;
export default macrosSlice.reducer;
