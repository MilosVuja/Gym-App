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

        return (
          <div
            key={id}
            className="border p-3 rounded cursor-pointer hover:bg-gray-100"
            onClick={() => onSelectMeal(meal)}
          >
            <p className="font-semibold">
              {customName || name || "Unnamed Meal"}
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