import {} from "react";
import MealHeader from "./MealHeader";
import MealIngredients from "./MealIngredients";
import MealFooter from "./MealFooter";

export default function MealBlock() {
  const ingredients = [
    {
      name: "egg",
      grams: "150g",
      values: [200, 50, 0, 0],
    },
    {
      name: "apple",
      grams: "100g",
      values: [80, 10, 0, 1],
    },
  ];

  return (
    <div className="border border-gray-300 shadow-sm">
      <MealHeader mealName="Meal Name" mealTime="8:00 AM" />
      {ingredients.map((ingredient, index) => (
        <MealIngredients key={index} ingredient={ingredient} />
      ))}
      <MealFooter ingredients={ingredients} />
    </div>
  );
}
