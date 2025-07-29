import { createSlice } from "@reduxjs/toolkit";

const renameMeals = (mealsArray) => {
  return mealsArray.map((meal, index) => ({
    ...meal,
    name: `Meal ${index + 1}`,
  }));
};

const initialState = {
  meals: [
    {
      id: 1,
      name: "Meal 1",
      time: "08:00",
      ingredients: [],
    },
  ],
};

const mealsSlice = createSlice({
  name: "meals",
  initialState,
  reducers: {
    addMeal(state, action) {
      state.meals.push(action.payload);
      state.meals = renameMeals(state.meals);
    },
    deleteMeal(state, action) {
      if (state.meals.length <= 1) {
        return;
      }
      state.meals = state.meals.filter((meal) => meal.id !== action.payload);
      state.meals.forEach((meal, i) => {
        meal.id = i + 1;
        meal.name = `Meal ${i + 1}`;
      });
    },
    updateMealName(state, action) {
      const { mealId, newName } = action.payload;
      const meal = state.meals.find((m) => m.id === mealId);
      if (meal) meal.name = newName;
    },
    updateMealTime(state, action) {
      const { mealId, time } = action.payload;
      const meal = state.meals.find((m) => m.id === mealId);
      if (meal) {
        meal.time = time;
      }
    },

    addIngredientToMeal: (state, action) => {
      const { mealId, ingredient } = action.payload;
      const meal = state.meals.find((m) => m.id === mealId);
      if (meal) {
        meal.ingredients.push(ingredient);
      }
    },
    editIngredientInMeal: (state, action) => {
      const { mealIndex, ingredientIndex, updatedIngredient } = action.payload;
      state.meals[mealIndex].ingredients[ingredientIndex] = updatedIngredient;
    },

    deleteIngredientFromMeal(state, action) {
      const { mealId, ingredientId } = action.payload;
      const meal = state.meals.find((m) => m.id === mealId);
      if (meal) {
        meal.ingredients = meal.ingredients.filter(
          (i) => i.id !== ingredientId
        );
      }
    },
    insertMealAtIndex(state, action) {
      const { index, meal } = action.payload;

      state.meals.splice(index + 1, 0, meal);

      state.meals.forEach((m, i) => {
        m.id = i + 1;
        m.name = `Meal ${i + 1}`;
      });
    },
  },
});

export const {
  addMeal,
  deleteMeal,
  updateMealName,
  updateMealTime,
  addIngredientToMeal,
  editIngredientInMeal,
  deleteIngredientFromMeal,
  insertMealAtIndex,
} = mealsSlice.actions;

export default mealsSlice.reducer;
