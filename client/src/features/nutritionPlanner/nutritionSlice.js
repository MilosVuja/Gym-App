import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  personalInfo: {
    gender: "male",
    height: "",
    weight: "",
    age: "",
    activity: "sedentary",
    goal: "lose",
  },
  recommendedMacros: null,
  customInput: {
    proteinPerKg: "",
    fatPerKg: "",
  },
  appliedCustomMacros: null,
  assignPeriod: "day",
  selectedDayIndex: 0,
  selectedMacrosForDay: "current",
  selectedMacrosForPeriod: "current",
  periodStartDate: null,
  periodEndDate: null,
  dayAdjustments: {
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  periodAdjustments: {
    protein: 0,
    carbs: 0,
    fat: 0,
  },
  assignedPlanByDay: {},
  assignedPlan: null,
  weekDays: [],
  errors: {},
};

const nutritionSlice = createSlice({
  name: "nutrition",
  initialState,
  reducers: {
    setPersonalInfo(state, action) {
      state.personalInfo = {
        ...state.personalInfo,
        ...action.payload,
      };
    },

    setRecommendedMacros(state, action) {
      state.recommendedMacros = action.payload;
    },
    setCustomInput(state, action) {
      const { name, value } = action.payload;
      state.customInput[name] = value;
    },
    setAppliedCustomMacros(state, action) {
      state.appliedCustomMacros = action.payload;
    },
    setAssignPeriod(state, action) {
      state.assignPeriod = action.payload;
    },
    setSelectedDayIndex(state, action) {
      state.selectedDayIndex = action.payload;
    },
    setSelectedMacrosForDay(state, action) {
      state.selectedMacrosForDay = action.payload;
    },
    setSelectedMacrosForPeriod(state, action) {
      state.selectedMacrosForPeriod = action.payload;
    },
    setPeriodStartDate(state, action) {
      state.periodStartDate = action.payload;
    },
    setPeriodEndDate(state, action) {
      state.periodEndDate = action.payload;
    },
    setDayAdjustments(state, action) {
      const { macro, value } = action.payload;
      state.dayAdjustments[macro] = value;
    },
    setPeriodAdjustments(state, action) {
      const { macro, value } = action.payload;
      state.periodAdjustments[macro] = value;
    },
    setAssignedPlanByDay(state, action) {
      state.assignedPlanByDay = {
        ...state.assignedPlanByDay,
        ...action.payload,
      };
    },
    setAssignedPlan(state, action) {
      state.assignedPlan = action.payload;
    },
    setWeekDays(state, action) {
      state.weekDays = action.payload;
    },
    setNutritionPlan(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
});

export const {
  setPersonalInfo,
  setRecommendedMacros,
  setCustomInput,
  setAppliedCustomMacros,
  setAssignPeriod,
  setSelectedDayIndex,
  setSelectedMacrosForDay,
  setSelectedMacrosForPeriod,
  setPeriodStartDate,
  setPeriodEndDate,
  setDayAdjustments,
  setPeriodAdjustments,
  setAssignedPlanByDay,
  setAssignedPlan,
  setWeekDays,
  setNutritionPlan,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;
