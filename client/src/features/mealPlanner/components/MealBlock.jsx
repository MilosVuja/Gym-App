import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MealHeader from "./MealHeader";
import MealIngredients from "./MealIngredients";
import IngredientEditModal from "./IngredientEditModal";
import MealFooter from "./MealFooter";
import { IoIosAddCircle } from "react-icons/io";
import { fetchIngredientFromNutritionix } from "../../../app/api/nutritionApi";

export default function MealBlock({
  ingredients = [],
  mealIndex,
  mealId,
  mealName,
  onNameChange,
  mealTime,
  onTimeChange,
  onMealTotalChange,
  onDelete,
  onEditIngredient,
  onDeleteIngredient,
  onAddMeal,
  isFavoriteMode = false,
  onCancelFavorite,
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
      if (!query.trim()) return;

      const fullData = await fetchIngredientFromNutritionix(query);
      if (!fullData || !fullData.alt_measures) return;

      const matchedUnitIndex = fullData.alt_measures.findIndex(
        (u) => u.measure === ingredient.unit
      );

      setSelectedIngredient({
        ...fullData,
        id: ingredient.id,
        name: fullData.food_name,
      });
      setModalQty(ingredient.quantity || 1);
      setModalUnitIndex(matchedUnitIndex >= 0 ? matchedUnitIndex : 0);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch ingredient data:", err);
    }
  };

  const handleSaveIngredient = (updatedIngredient) => {
    const fullUpdatedIngredient = {
      ...selectedIngredient,
      ...updatedIngredient,
      name: selectedIngredient.name,
      values: updatedIngredient.values || selectedIngredient.values,
    };

    const ingIndex = ingredients.findIndex(
      (i) => i.id === fullUpdatedIngredient.id
    );
    if (ingIndex !== -1) {
      onEditIngredient(mealIndex, ingIndex, fullUpdatedIngredient);
      setIsModalOpen(false);
      setSelectedIngredient(null);
    }
  };

  return (
    <div className="border border-white shadow-sm rounded">
      <MealHeader
        mealId={mealId}
        mealName={mealName || "Favorite Meal"}
        onNameChange={onNameChange}
        mealTime={mealTime}
        onTimeChange={onTimeChange}
        onDelete={onDelete}
        isFirstMeal={mealIndex === 0}
        isFavoriteMode={isFavoriteMode}
        onAddMeal={onAddMeal}
        onCancelFavorite={onCancelFavorite}
      />

      {ingredients.map((ingredient) => (
        <MealIngredients
          key={ingredient.id}
          ingredient={ingredient}
          onDelete={() => onDeleteIngredient(mealId, ingredient.id)}
          onEdit={() => handleEditIngredientClick(ingredient)}
          isFavoriteMode={isFavoriteMode}
          onCancelFavorite={onCancelFavorite}
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
          onClose={() => {
            setIsModalOpen(false);
            setSelectedIngredient(null);
          }}
          onSave={handleSaveIngredient}
        />
      )}
      {!isFavoriteMode && (
        <div className="flex justify-end mt-2 gap-2 mx-3">
          <button
            onClick={handleAddIngredientClick}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            title="Add ingredient"
          >
            <IoIosAddCircle className="w-4 h-4" />
            Add Ingredient
          </button>
          <button
            onClick={handleAddIngredientClick}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            title="Add favorite meal"
          >
            <IoIosAddCircle className="w-4 h-4 text-white" />
            Add Favorite Meal
          </button>
        </div>
      )}
      <MealFooter
        ingredients={ingredients}
        onMealTotalChange={onMealTotalChange}
      />
    </div>
  );
}
