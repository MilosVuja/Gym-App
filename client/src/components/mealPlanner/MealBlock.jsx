import { useNavigate } from "react-router-dom";
import MealHeader from "./MealHeader";
import MealIngredients from "./MealIngredients";
import MealFooter from "./MealFooter";
import { IoIosAddCircle } from "react-icons/io";

export default function MealBlock({
  ingredients,
  mealIndex,
  mealId,
  onMealTotalChange,
  onDelete,
  onDeleteIngredient,
  onAddMeal,
}) {
  const navigate = useNavigate();

  const handleAddIngredientClick = () => {
    navigate(`/members/meal-planner/select-ingredients/${mealId}`);

  };

  return (
    <div className="border border-white shadow-sm rounded">
      <MealHeader
        mealName={`Meal ${mealIndex + 1}`}
        mealTime="08:00h"
        onDelete={onDelete}
        onAddMeal={onAddMeal}
      />
      {ingredients.map((ingredient, index) => (
        <MealIngredients
          key={ingredient.id || `${ingredient.name}-${index}`}
          ingredient={ingredient}
          onDelete={() => onDeleteIngredient(mealIndex, index)}
        />
      ))}
      <div className="text-right mt-2 mr-1">
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
