import { useState } from "react";
import FavoriteMealsList from "./FavoriteMealsList";
import AddToMealModal from "../ingredientPicker/AddToMeal";
import { useSelector, useDispatch } from "react-redux";
import { addIngredientToMeal } from "../../redux/mealsSlice";
import { v4 as uuidv4 } from "uuid";

const filter_tags = [
  "High Protein",
  "Low Calorie",
  "Low Carb",
  "Quick",
  "Kid-friendly",
  "Easy Prep",
];

export default function FavoriteMealsPanel({ favorites }) {
  const dispatch = useDispatch();
  const meals = useSelector((state) => state.meals.meals || []);

  const [searchText, setSearchText] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedFavMeal, setSelectedFavMeal] = useState(null);

  const toggleFilter = (tag) => {
    setActiveFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredMeals = favorites.filter((meal) => {
    const name = (meal.name || "").toLowerCase();
    const search = searchText.toLowerCase();

    const matchesName = name.includes(search);
    const matchesFilters =
      activeFilters.length === 0 ||
      activeFilters.every((tag) => meal.tags?.includes(tag));

    return matchesName && matchesFilters;
  });

  const openAddToMealModal = (meal) => setSelectedFavMeal(meal);
  const closeAddToMealModal = () => setSelectedFavMeal(null);

  const handleAddFavoriteMealToMeals = (selectedMealIds, favoriteMeal) => {
    if (!favoriteMeal) return;

    favoriteMeal.ingredients.forEach((ingredient) => {
      const newIngredient = {
        ...ingredient,
        id: uuidv4(),
      };

      selectedMealIds.forEach((mealId) => {
        const targetMeal = meals.find((m) => m.id === mealId);
        if (!targetMeal) return;

        const isDuplicate = targetMeal.ingredients?.some(
          (ing) =>
            ing.name.toLowerCase() === newIngredient.name.toLowerCase() &&
            ing.unit === newIngredient.unit &&
            Number(ing.quantity) === Number(newIngredient.quantity)
        );

        if (!isDuplicate) {
          dispatch(addIngredientToMeal({ mealId, ingredient: newIngredient }));
        }
      });
    });

    closeAddToMealModal();
  };

  return (
    <div className="p-4 border rounded shadow max-h-[600px] overflow-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Your Favorite Meals:
      </h2>

      <input
        type="text"
        placeholder="Search meals by name only"
        className="mb-1 w-full border rounded px-3 py-2"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <p className="text-xs italic text-gray-500 mb-3 text-center">
        (Search filters by meal name only)
      </p>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {filter_tags.map((tag) => {
          const isActive = activeFilters.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleFilter(tag)}
              className={`px-3 py-1 rounded text-sm border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      <FavoriteMealsList
        meals={filteredMeals}
        onSelectMeal={openAddToMealModal}
      />

      {selectedFavMeal && (
        <AddToMealModal
          ingredient={selectedFavMeal}
          meals={meals}
          onClose={closeAddToMealModal}
          onConfirm={(selectedMealIds) =>
            handleAddFavoriteMealToMeals(selectedMealIds, selectedFavMeal)
          }
        />
      )}
    </div>
  );
}
