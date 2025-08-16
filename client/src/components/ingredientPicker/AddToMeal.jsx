import { useState } from "react";

function AddToMealModal({ ingredient, meals, onClose, onConfirm }) {
  const todaysMeals = meals || [];

  const [selectedMeals, setSelectedMeals] = useState(
    todaysMeals.length ? [todaysMeals[0].id] : []
  );

  const toggleMeal = (mealId) => {
    setSelectedMeals((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleConfirm = () => {
    if (selectedMeals.length === 0) return;
    onConfirm(selectedMeals, ingredient);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-4 w-[300px] max-w-[90%]">
        <h2 className="text-lg font-semibold mb-3">Add to Meal</h2>

        {todaysMeals.length > 0 ? (
          <div className="space-y-2 mb-4">
            {todaysMeals.map((meal) => (
              <label key={meal.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedMeals.includes(meal.id)}
                  onChange={() => toggleMeal(meal.id)}
                />
                <span>{meal.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">No meals available.</p>
        )}

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 rounded bg-gray-200" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-blue-500 text-white"
            onClick={handleConfirm}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddToMealModal;
