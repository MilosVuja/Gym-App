import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFavoriteIngredient,
  updateFavoriteComment,
} from "../../redux/favoritesSlice";
import { addIngredientToMeal } from "../../redux/mealsSlice";
import { v4 as uuidv4 } from "uuid";
import AddToMealModal from "./AddToMeal";
import DeleteButton from "../common/DeleteButton";

const capitalizeWords = (text = "") =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

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

export default function FavoriteIngredientsList() {
  const dispatch = useDispatch();
  const meals = useSelector((state) => state.meals.meals || []);
  const favoriteIngredients = useSelector(
    (state) => state.favorites.favoriteIngredients
  );

  const [editingKey, setEditingKey] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const startEditing = (ingredient, uniqueKey) => {
    setEditingKey(uniqueKey);
    setCommentText(ingredient.comment || "");
  };

  const finishEditing = (ingredient) => {
    dispatch(
      updateFavoriteComment({
        id: ingredient.id,
        serving_qty: ingredient.serving_qty,
        serving_unit: ingredient.serving_unit,
        comment: commentText.trim(),
      })
    );
    setEditingKey(null);
  };

  const handleRemove = (ingredient) => {
    dispatch(removeFavoriteIngredient(ingredient.id));
  };

  const openModal = (ingredient) => setSelectedIngredient(ingredient);
  const closeModal = () => setSelectedIngredient(null);

  const handleAddToMeal = (selectedMealIds, ingredient) => {
    if (!ingredient) return;

    const newIngredient = {
      id: uuidv4(),
      name: ingredient.food_name || ingredient.name || "Unnamed",
      quantity: parseFloat(
        ingredient.serving_qty ?? ingredient.quantity ?? 1
      ).toFixed(1),

      unit: ingredient.serving_unit ?? ingredient.unit ?? "",
      comment: ingredient.comment || "",
      values: [
        Number(ingredient.nf_calories ?? ingredient.values?.[0] ?? 0),
        Number(ingredient.nf_protein ?? ingredient.values?.[1] ?? 0),
        Number(ingredient.nf_total_carbohydrate ?? ingredient.values?.[2] ?? 0),
        Number(ingredient.nf_total_fat ?? ingredient.values?.[3] ?? 0),
      ],
    };

    selectedMealIds.forEach((mealId) => {
      const targetMeal = meals.find((m) => m.id === mealId);
      if (!targetMeal) return;

      const isDuplicate = targetMeal.ingredients?.some(
        (ing) =>
          ing.name.toLowerCase() === newIngredient.name.toLowerCase() &&
          ing.unit === newIngredient.unit &&
          Number(ing.quantity) === Number(newIngredient.quantity)
      );

      if (!isDuplicate) {
        dispatch(addIngredientToMeal({ mealId, ingredient: newIngredient }));
      }
    });

    closeModal();
  };

  if (!favoriteIngredients.length) {
    return (
      <p className="text-center text-gray-500 mt-10">
        No favorite ingredients yet.
      </p>
    );
  }

  return (
    <>
      <div className="max-h-[400px] overflow-auto space-y-3 border rounded p-3">
        {favoriteIngredients.filter(Boolean).map((ingredient) => {
          const { id, food_name, serving_qty, serving_unit, comment } =
            ingredient;
          const uniqueKey = `${id}_${serving_qty}_${serving_unit}`;
          const displayName = capitalizeWords(
            food_name || ingredient.name || ""
          );

          return (
            <div
              key={uniqueKey}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-700 cursor-default"
            >
              <div className="flex flex-col truncate w-full">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">
                      {displayName}
                    </span>

                    {editingKey === uniqueKey ? (
                      <input
                        type="text"
                        className="text-gray-300 text-sm italic ml-2 px-1 rounded border border-gray-600 bg-gray-800"
                        value={commentText}
                        autoFocus
                        onChange={(e) => setCommentText(e.target.value)}
                        onBlur={() => finishEditing(ingredient)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") finishEditing(ingredient);
                          if (e.key === "Escape") setEditingKey(null);
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => startEditing(ingredient, uniqueKey)}
                        className={`text-gray-500 text-sm italic ml-2 cursor-pointer select-none ${
                          comment ? "" : "opacity-50"
                        }`}
                        title="Click to edit comment"
                      >
                        {comment || "No comment"}
                      </span>
                    )}
                  </div>

                  <DeleteButton
                    name={displayName}
                    onDelete={() => handleRemove(ingredient)}
                  />
                </div>

                {(serving_qty || ingredient.quantity) && (
                  <small className="text-gray-400 text-xs mt-1">
                    {serving_qty ?? ingredient.quantity}{" "}
                    {unitMap[serving_unit] || unitMap[ingredient.unit] || ""}
                  </small>
                )}

                <small className="text-gray-600 text-xs mt-1">
                  calories: {ingredient.values?.[0] ?? 0} kcal, proteins:{" "}
                  {ingredient.values?.[1] ?? 0}, carbs:{" "}
                  {ingredient.values?.[2] ?? 0}, fat:{" "}
                  {ingredient.values?.[3] ?? 0}
                </small>

                <button
                  className="text-xs text-green-500 hover:text-green-600 underline mt-2 self-start"
                  onClick={() => openModal(ingredient)}
                >
                  + Add to Meal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedIngredient && (
        <AddToMealModal
          ingredient={selectedIngredient}
          meals={meals}
          onClose={closeModal}
          onConfirm={handleAddToMeal}
        />
      )}
    </>
  );
}
