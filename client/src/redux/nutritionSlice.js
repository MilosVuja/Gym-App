import { createSlice } from "@reduxjs/toolkit";

function calculateAdjustedMacros(baseMacros, adjustments) {
  if (!baseMacros) return null;
  const protein = (baseMacros.protein || 0) + (adjustments.protein || 0);
  const carbs = (baseMacros.carbs || 0) + (adjustments.carbs || 0);
  const fat = (baseMacros.fat || 0) + (adjustments.fat || 0);

  const calories = protein * 4 + carbs * 4 + fat * 9;

  return {
    calories: Math.max(0, Math.round(calories)),
    protein: Math.max(0, Math.round(protein)),
    carbs: Math.max(0, Math.round(carbs)),
    fat: Math.max(0, Math.round(fat)),
  };
}

const initialState = {
  personalInfo: {
    weight: null,
    height: null,
    age: null,
    gender: "",
    activityLevel: "",
    goal: "",
  },
  recommendedMacros: {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  },
  customizedInput: {
    proteinPerKg: null,
    fatPerKg: null,
  },
  customizedMacros: {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  },
  adjustments: {
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  adjustedMacros: {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  },
  mode: "recommended",
  assignedMacrosByDay: {
  },
};

const nutritionSlice = createSlice({
  name: "nutrition",
  initialState,
  reducers: {
    updatePersonalInfo(state, action) {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    setRecommendedMacros(state, action) {
      state.recommendedMacros = action.payload;

      if (state.mode === "recommended" || state.mode === "adjusted") {
        state.adjustedMacros = calculateAdjustedMacros(
          action.payload,
          state.adjustments
        );
      }
    },
    setCustomizedInput(state, action) {
      state.customizedInput = { ...state.customizedInput, ...action.payload };
    },
    setCustomizedMacros(state, action) {
      state.customizedMacros = action.payload;

      if (state.mode === "customized" || state.mode === "adjusted") {
        state.adjustedMacros = calculateAdjustedMacros(
          action.payload,
          state.adjustments
        );
      }
    },
    setAdjustments(state, action) {
      state.adjustments = action.payload;

      if (state.mode === "adjusted") {
        const baseMacros =
          state.mode === "customized"
            ? state.customizedMacros
            : state.recommendedMacros;
        state.adjustedMacros = calculateAdjustedMacros(
          baseMacros,
          action.payload
        );
      }
    },
    setMode(state, action) {
      state.mode = action.payload;
    },
    assignMacrosToDay(state, action) {
      const { dayIndex, base, adjustments, adjustedMacros } = action.payload;
      state.assignedMacrosByDay[dayIndex] = {
        base,
        adjustments,
        adjustedMacros,
      };
    },
    resetNutritionState(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  updatePersonalInfo,
  setRecommendedMacros,
  setCustomizedInput,
  setCustomizedMacros,
  setAdjustments,
  setMode,
  assignMacrosToDay,
  resetNutritionState,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;
