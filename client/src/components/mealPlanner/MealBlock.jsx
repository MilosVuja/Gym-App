import {} from "react";
import MealHeader from "./MealHeader";
import MealIngredients from "./MealIngredients";
import MealFooter from "./MealFooter";

export default function MealBlock() {
  return (
    <div className="border border-gray-300 shadow-sm">
      <MealHeader mealName="Breakfast" mealTime="8:00 AM" />
      <MealIngredients />
      <MealIngredients />
      <MealIngredients />
      <MealFooter />
    </div>
  );
}
