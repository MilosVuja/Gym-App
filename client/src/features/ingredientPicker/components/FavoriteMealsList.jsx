export default function FavoriteMealsList({ meals, onSelectMeal }) {
  if (!meals || meals.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">No favorite meals yet.</p>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-auto">
      {meals.map((meal) => {
        const { id, customName, name, ingredients } = meal;
        const ingredientCount = Array.isArray(ingredients)
          ? ingredients.length
          : 0;

        const totalMacros = ingredients?.reduce(
          (totals, ing) => {
            const [calories, protein, carbs, fat] = ing.values || [0, 0, 0, 0];
            return [
              totals[0] + (typeof calories === "number" ? calories : 0),
              totals[1] + (typeof protein === "number" ? protein : 0),
              totals[2] + (typeof carbs === "number" ? carbs : 0),
              totals[3] + (typeof fat === "number" ? fat : 0),
            ];
          },
          [0, 0, 0, 0]
        ) || [0, 0, 0, 0];

        const [totalCalories, totalProtein, totalCarbs, totalFat] = totalMacros;

        return (
          <div
            key={id}
            className="border p-3 rounded hover:bg-gray-100 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold">
                {customName || name || "Unnamed Meal"}
              </p>

              <button
                className="text-xs text-green-500 hover:text-green-600 underline"
                onClick={() => onSelectMeal(meal)}
              >
                + Add to Meal
              </button>
            </div>

            <p className="text-xs text-gray-700">
              calories: {Math.round(totalCalories)} | protein:{" "}
              {Math.round(totalProtein)} | carbs: {Math.round(totalCarbs)} |
              fat: {Math.round(totalFat)}
            </p>
            <p className="text-xs text-gray-600">
              {ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}
