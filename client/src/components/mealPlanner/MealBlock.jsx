import {} from "react";
import MealHeader from "./MealHeader";
import MealIngredients from "./MealIngredients";
import MealFooter from "./MealFooter";

export default function MealBlock({ ingredients, onMealTotalChange, onDelete }) {

  
  return (
    <div className="border border-gray-300 shadow-sm">
      <MealHeader mealName="Meal Name" mealTime="8:00 AM" onDelete={onDelete}/>
      {ingredients.map((ingredient) => (
        <MealIngredients
          key={ingredient.id || ingredient.name}
          ingredient={ingredient}
        />
      ))}
      <MealFooter
        ingredients={ingredients}
        onMealTotalChange={onMealTotalChange}
      />
    </div>
  );
}
