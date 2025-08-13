import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favoriteMeals: [],
  favoriteIngredients: [],
};

const sortIngredients = (ingredients) =>
  ingredients.sort((a, b) => {
    const nameCompare = a.food_name.localeCompare(b.food_name);
    if (nameCompare !== 0) return nameCompare;
    return a.serving_qty - b.serving_qty;
  });

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavoriteMeal(state, action) {
      const meal = action.payload;
      const exists = state.favoriteMeals.some((m) => m.id === meal.id);
      if (!exists) {
        state.favoriteMeals.push(meal);
      }
    },

    removeFavoriteMeal(state, action) {
      const mealId = action.payload;
      state.favoriteMeals = state.favoriteMeals.filter(
        (fav) => fav.id !== mealId
      );
    },
    addFavoriteIngredient(state, action) {
      const ingredient = action.payload;
      const exists = state.favoriteIngredients.some(
        (item) =>
          String(item.id) === String(ingredient.id) &&
          item.serving_qty === ingredient.serving_qty &&
          item.serving_unit === ingredient.serving_unit
      );
      if (!exists) {
        state.favoriteIngredients.push(ingredient);
        sortIngredients(state.favoriteIngredients);
      }
    },

    removeFavoriteIngredient(state, action) {
      const { id, serving_qty, serving_unit } = action.payload;
      state.favoriteIngredients = state.favoriteIngredients.filter(
        (item) =>
          !(
            item.id === id &&
            item.serving_qty === serving_qty &&
            item.serving_unit === serving_unit
          )
      );
    },

    updateFavoriteComment(state, action) {
      const { id, serving_qty, serving_unit, comment } = action.payload;
      const index = state.favoriteIngredients.findIndex(
        (fav) =>
          fav.id === id &&
          fav.serving_qty === serving_qty &&
          fav.serving_unit === serving_unit
      );
      if (index !== -1) {
        state.favoriteIngredients[index].comment = comment;
      }
    },
  },
});

export const {
  addFavoriteMeal,
  removeFavoriteMeal,
  addFavoriteIngredient,
  removeFavoriteIngredient,
  updateFavoriteComment,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;