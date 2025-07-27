import { createSlice } from "@reduxjs/toolkit";

// Helper to rename meals based on their index
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
      ingredients: [
        { id: 0, name: "Egg", values: [100, 40, 10, 5] },
        { id: 1, name: "Chicken Breast", values: [100, 40, 10, 5] },
      ],
    },
    {
      id: 2,
      name: "Meal 2",
      ingredients: [{ id: 2, name: "Rice", values: [50, 20, 5, 2] }],
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
        // Don't delete if only one meal remains
        return;
      }
      state.meals = state.meals.filter((meal) => meal.id !== action.payload);
      state.meals.forEach((meal, i) => {
        meal.id = i + 1;
        meal.name = `Meal ${i + 1}`;
      });
    },

    updateMealName(state, action) {
      const { mealId, name } = action.payload;
      const meal = state.meals.find((m) => m.id === mealId);
      if (meal) meal.name = name;
    },
    addIngredientToMeal: (state, action) => {
      const { mealId, ingredient } = action.payload;
      console.log("Reducer adding ingredient", ingredient, "to mealId", mealId);
      const meal = state.meals.find((m) => m.id === mealId);
      if (meal) {
        meal.ingredients.push(ingredient);
      } else {
        console.warn("Meal not found for id", mealId);
      }
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

      // Insert meal at the given index + 1
      state.meals.splice(index + 1, 0, meal);

      // Reassign new ids and names to every meal
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
  addIngredientToMeal,
  deleteIngredientFromMeal,
  insertMealAtIndex,
} = mealsSlice.actions;

export default mealsSlice.reducer;
