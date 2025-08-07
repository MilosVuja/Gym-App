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

    toggleFavoriteIngredient(state, action) {
      const newIngredient = {
        ...action.payload,
        comment: action.payload.comment || "",
      };

      const existingIndex = state.favoriteIngredients.findIndex(
        (fav) =>
          fav.id === newIngredient.id &&
          fav.serving_qty === newIngredient.serving_qty &&
          fav.serving_unit === newIngredient.serving_unit &&
          fav.comment === newIngredient.comment
      );

      if (existingIndex !== -1) {
        state.favoriteIngredients.splice(existingIndex, 1);
      } else {
        const sameIngredientIndex = state.favoriteIngredients.findIndex(
          (fav) =>
            fav.id === newIngredient.id &&
            fav.serving_qty === newIngredient.serving_qty &&
            fav.serving_unit === newIngredient.serving_unit
        );

        if (sameIngredientIndex !== -1) {
          state.favoriteIngredients[sameIngredientIndex].comment =
            newIngredient.comment;
        } else {
          state.favoriteIngredients.push(newIngredient);
        }
      }
      state.favoriteIngredients.sort((a, b) => {
        const nameCompare = a.food_name.localeCompare(b.food_name);
        if (nameCompare !== 0) return nameCompare;
        return a.serving_qty - b.serving_qty;
      });
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
  toggleFavoriteMeal,
  toggleFavoriteIngredient,
  updateFavoriteComment,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
