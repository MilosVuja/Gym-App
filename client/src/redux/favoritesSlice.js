import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favoriteMeals: [],
  favoriteIngredients: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    addFavoriteMeal(state, action) {
      if (!state.favoriteMeals.includes(action.payload)) {
        state.favoriteMeals.push(action.payload);
      }
    },
    removeFavoriteMeal(state, action) {
      state.favoriteMeals = state.favoriteMeals.filter(
        (id) => id !== action.payload
      );
    },
    addFavoriteIngredient(state, action) {
      if (!state.favoriteIngredients.includes(action.payload)) {
        state.favoriteIngredients.push(action.payload);
      }
    },
    removeFavoriteIngredient(state, action) {
      state.favoriteIngredients = state.favoriteIngredients.filter(
        (id) => id !== action.payload
      );
    },

    toggleFavoriteMeal(state, action) {
      const id = String(action.payload);
      if (state.favoriteMeals.includes(id)) {
        state.favoriteMeals = state.favoriteMeals.filter(
          (favId) => favId !== id
        );
      } else {
        state.favoriteMeals.push(id);
      }
    },

    toggleFavoriteIngredient(state, action) {
      const id = action.payload;
      if (state.favoriteIngredients.includes(id)) {
        state.favoriteIngredients = state.favoriteIngredients.filter(
          (favId) => favId !== id
        );
      } else {
        state.favoriteIngredients.push(id);
      }
    },
  },
});

export const {
  addFavoriteMeal,
  removeFavoriteMeal,
  addFavoriteIngredient,
  removeFavoriteIngredient,
  toggleFavoriteMeal,
  toggleFavoriteIngredient,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
