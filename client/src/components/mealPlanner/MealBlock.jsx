import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MealHeader from "./MealHeader";
import MealIngredients from "./MealIngredients";
import IngredientEditModal from "./IngredientEditModal";
import MealFooter from "./MealFooter";
import { IoIosAddCircle } from "react-icons/io";
import { fetchIngredientFromNutritionix } from "../../api/nutritionApi";
import { FaRegStar, FaStar } from "react-icons/fa";

export default function MealBlock({
  ingredients,
  mealIndex,
  mealId,
  onMealTotalChange,
  onDelete,
  onEditIngredient,
  onDeleteIngredient,
  onAddMeal,
  favoriteMeals,
  toggleFavoriteMeal,
}) {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalUnitIndex, setModalUnitIndex] = useState(0);

  const handleAddIngredientClick = () => {
    navigate(`/members/meal-planner/select-ingredients/${mealId}`);
  };

  const handleEditIngredientClick = async (ingredient) => {
    try {
      const query = ingredient.food_name || ingredient.name || "";

      if (!query.trim()) {
        console.warn(
          "Ingredient missing valid name for nutrition fetch:",
          ingredient
        );
        return;
      }

      const fullData = await fetchIngredientFromNutritionix(query);

      if (!fullData || !fullData.alt_measures) {
        console.warn("No alt_measures found for", query);
        return;
      }

      const matchedUnitIndex = fullData.alt_measures.findIndex(
        (u) => u.measure === ingredient.unit
      );

      setSelectedIngredient({
        ...fullData,
        id: ingredient.id,
      });

      setModalQty(ingredient.quantity || 1);
      setModalUnitIndex(matchedUnitIndex >= 0 ? matchedUnitIndex : 0);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch ingredient data:", err);
    }
  };

  const handleSaveIngredient = (updatedIngredient) => {
    const ingIndex = ingredients.findIndex(
      (ing) => ing.id === updatedIngredient.id
    );
    if (ingIndex === -1) {
      console.warn("Ingredient to update not found:", updatedIngredient.id);
      return;
    }

    onEditIngredient(mealIndex, ingIndex, updatedIngredient);
    setIsModalOpen(false);
    setSelectedIngredient(null);
  };

  const isFavorite = favoriteMeals.includes(mealId);

  return (
    <div className="border border-white shadow-sm rounded">
      <div className="flex justify-between items-center px-4 pt-4">
        <MealHeader
          mealName={`Meal ${mealIndex + 1}`}
          mealTime="08:00h"
          onDelete={onDelete}
          onAddMeal={onAddMeal}
        />
        <button
          onClick={() => toggleFavoriteMeal(mealId)}
          className="text-yellow-400 text-xl focus:outline-none"
          title={isFavorite ? "Unfavorite" : "Mark as favorite"}
        >
          {isFavorite ? <FaStar /> : <FaRegStar />}
        </button>
      </div>

      {ingredients.map((ingredient) => (
        <MealIngredients
          key={ingredient.id}
          ingredient={ingredient}
          onDelete={() => onDeleteIngredient(mealId, ingredient.id)}
          onEdit={handleEditIngredientClick}
        />
      ))}

      {isModalOpen && selectedIngredient && (
        <IngredientEditModal
          ingredient={selectedIngredient}
          quantity={modalQty}
          selectedUnitIndex={modalUnitIndex}
          units={selectedIngredient.alt_measures || []}
          onQtyChange={setModalQty}
          onUnitChange={setModalUnitIndex}
          onClose={() => setIsModalOpen(false)}
          onSave={(qty, unitIdx, newValues) => {
            const updatedIngredient = {
              ...selectedIngredient,
              quantity: qty,
              unit: selectedIngredient.alt_measures[unitIdx]?.measure,
              values: newValues,
            };
            handleSaveIngredient(updatedIngredient);
          }}
        />
      )}

      <div className="text-right mt-2 mr-2.5">
        <button
          onClick={handleAddIngredientClick}
          className="text-sm text-blue-500"
        >
          <IoIosAddCircle className="size-5" title="Add ingredient" />
        </button>
      </div>

      <MealFooter
        ingredients={ingredients}
        onMealTotalChange={onMealTotalChange}
      />
    </div>
  );
}
