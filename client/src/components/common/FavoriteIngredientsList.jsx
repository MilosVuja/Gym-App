import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFavoriteIngredient,
  updateFavoriteComment,
} from "../../redux/favoritesSlice";
import { addIngredientToMeal } from "../../redux/mealsSlice";
import DeleteButton from "./DeleteButton";

export default function FavoriteIngredientsList({ meals }) {
  const dispatch = useDispatch();
  const favoriteIngredients = useSelector(
    (state) => state.favorites.favoriteIngredients
  );

  const [editingId, setEditingId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const startEditing = (ingredient) => {
    setEditingId(
      ingredient.id +
        "_" +
        ingredient.serving_qty +
        "_" +
        ingredient.serving_unit
    );
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
    setEditingId(null);
  };

  const handleRemoveFavorite = (ingredient) => {
    dispatch(
      removeFavoriteIngredient({
        id: ingredient.id,
        serving_qty: ingredient.serving_qty,
        serving_unit: ingredient.serving_unit,
      })
    );
  };

  const openModal = (ingredient) => {
    setSelectedIngredient(ingredient);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedIngredient(null);
    setShowModal(false);
  };

  const handleAddToMeal = (selectedMealIds) => {
    if (!selectedIngredient) return;

    const ingredient = {
      id: uuidv4(),
      name: selectedIngredient.food_name,
      quantity: selectedIngredient.serving_qty,
      unit: selectedIngredient.serving_unit,
      comment: selectedIngredient.comment || "",
      values: [
        Math.round(selectedIngredient.nf_calories),
        Math.round(selectedIngredient.nf_protein),
        Math.round(selectedIngredient.nf_total_carbohydrate),
        Math.round(selectedIngredient.nf_total_fat),
      ],
    };

    selectedMealIds.forEach((mealId) => {
      dispatch(addIngredientToMeal({ mealId, ingredient }));
    });

    closeModal();
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
    <>
      <div className="max-h-[400px] overflow-auto space-y-3 border rounded p-3">
        {favoriteIngredients.map((ingredient) => {
          const {
            id,
            food_name,
            nf_calories,
            nf_protein,
            nf_total_carbohydrate,
            nf_total_fat,
            serving_qty,
            serving_unit,
            comment,
          } = ingredient;

          const uniqueKey = id + "_" + serving_qty + "_" + serving_unit;

          return (
            <div
              key={uniqueKey}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-700 cursor-default"
            >
              <div className="flex flex-col truncate w-full">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">
                      {food_name.replace(/\b\w/g, (char) => char.toUpperCase())}
                    </span>
                    {editingId === uniqueKey ? (
                      <input
                        type="text"
                        className="text-gray-300 text-sm italic ml-2 px-1 rounded border border-gray-600 bg-gray-800"
                        value={commentText}
                        autoFocus
                        onChange={(e) => setCommentText(e.target.value)}
                        onBlur={() => finishEditing(ingredient)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            finishEditing(ingredient);
                          }
                          if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                      />
                    ) : (
                      <span
                        onClick={() => startEditing(ingredient)}
                        className={`text-gray-500 text-sm italic ml-2 cursor-pointer select-none ${
                          comment ? "" : "opacity-50"
                        }`}
                        title="Click to edit comment"
                      >
                        {comment || "No comment"}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 items-center">
                    <DeleteButton
                      name={food_name.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                      onDelete={() => handleRemoveFavorite(ingredient)}
                    />
                  </div>
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

      {showModal && selectedIngredient && (
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
