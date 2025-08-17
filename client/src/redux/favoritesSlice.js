import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favoriteMeals: [],
  favoriteIngredients: [],
};

const sortIngredients = (ingredients) =>
  ingredients.sort((a, b) => {
    const nameA = a.name?.toLowerCase() ?? "";
    const nameB = b.name?.toLowerCase() ?? "";
    const nameCompare = nameA.localeCompare(nameB);
    if (nameCompare !== 0) return nameCompare;

    const qtyA = isNaN(Number(a.quantity)) ? 0 : Number(a.quantity);
    const qtyB = isNaN(Number(b.quantity)) ? 0 : Number(b.quantity);

    return qtyA - qtyB;
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
    updateFavoriteMeal: (state, action) => {
      const index = state.favoriteMeals.findIndex(
        (m) => m.id === action.payload.id
      );
      if (index !== -1) {
        state.favoriteMeals[index] = action.payload;
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
        console.log("Added! New favorites:", state.favoriteIngredients);
      }
    },
    removeFavoriteIngredient(state, action) {
      state.favoriteIngredients = state.favoriteIngredients.filter(
        (ing) => ing.id !== action.payload
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
