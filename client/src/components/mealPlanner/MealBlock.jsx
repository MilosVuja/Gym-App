import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MealHeader from "./MealHeader";
import MealIngredients from "./MealIngredients";
import IngredientEditModal from "./IngredientEditModal";
import MealFooter from "./MealFooter";
import { IoIosAddCircle } from "react-icons/io";
import { fetchIngredientFromNutritionix } from "../../api/nutritionApi";

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
      />

      {ingredients.map((ingredient) => (
        <MealIngredients
          key={ingredient.id}
          ingredient={ingredient}
          onDelete={() => onDeleteIngredient(mealId, ingredient.id)}
          onEdit={() => handleEditIngredientClick(ingredient)}
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

      <div className="text-right mt-2 mr-2">
        <button
          onClick={handleAddIngredientClick}
          className="text-sm text-blue-500"
          title="Add ingredient"
        >
          <IoIosAddCircle className="size-5" />
        </button>
      </div>

      <MealFooter
        ingredients={ingredients}
        onMealTotalChange={onMealTotalChange}
      />
    </div>
  );
}
