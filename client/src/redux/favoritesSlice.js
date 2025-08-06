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
    addFavoriteIngredient(state, action) {
      const exists = state.favoriteIngredients.find(
        (item) => String(item.id) === String(action.payload.id)
      );
      if (!exists) {
        state.favoriteIngredients.push(action.payload);
      }
    },
    removeFavoriteIngredient(state, action) {
      state.favoriteIngredients = state.favoriteIngredients.filter(
        (item) => item.id !== action.payload
      );
    },
    toggleFavoriteIngredient(state, action) {
      const id = String(action.payload.id);
      const index = state.favoriteIngredients.findIndex(
        (item) => String(item.id) === id
      );
      if (index >= 0) {
        state.favoriteIngredients.splice(index, 1);
      } else {
        state.favoriteIngredients.push(action.payload);
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
