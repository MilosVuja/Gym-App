import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeFavoriteIngredient } from "../../redux/favoritesSlice";
import DeleteButton from "./DeleteButton";

export default function FavoriteIngredientsList() {
  const dispatch = useDispatch();
  const favoriteIngredients = useSelector(
    (state) => state.favorites.favoriteIngredients
  );

  const handleRemoveFavorite = (ingredientId) => {
    dispatch(removeFavoriteIngredient(ingredientId));
  };

  if (favoriteIngredients.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No favorite ingredients yet.
      </p>
    );
  }

  const unitMap = {
    g: "grams",
    oz: "ounces",
    ml: "milliliters",
    l: "liters",
    cup: "cup",
    tbsp: "tablespoon",
    tsp: "teaspoon",
    slice: "slice",
    piece: "piece",
  };

  return (
    <div className="max-h-[400px] overflow-auto space-y-3 border rounded p-3">
      {favoriteIngredients.map(
        ({
          id,
          food_name,
          nf_calories,
          nf_protein,
          nf_total_carbohydrate,
          nf_total_fat,
          serving_qty,
          serving_unit,
        }) => (
          <div
            key={id}
            className="flex justify-between items-center p-2 rounded hover:bg-gray-700 cursor-default"
          >
            <div className="flex flex-col truncate w-full">
              <div className="flex justify-between items-center w-full">
                <span className="font-semibold truncate">
                  {food_name.replace(/\b\w/g, (char) => char.toUpperCase())}
                </span>
                <DeleteButton
                  name={food_name.replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                  )}
                  onDelete={() => handleRemoveFavorite(id)}
                />
              </div>
              <small className="text-gray-600 text-xs mt-1">
                {serving_qty} {unitMap[serving_unit] || serving_unit}
              </small>
              <small className="text-gray-600 text-xs mt-1">
                calories: {Math.round(nf_calories)} kcal, proteins:{" "}
                {Math.round(nf_protein)}, carbs:{" "}
                {Math.round(nf_total_carbohydrate)}, fat:{" "}
                {Math.round(nf_total_fat)}
              </small>
            </div>
          </div>
        )
      )}
    </div>
  );
}
