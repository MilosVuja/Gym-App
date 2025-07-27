import { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { addIngredientToMeal } from "../../redux/mealsSlice";

export default function IngredientPicker() {
  const dispatch = useDispatch();


  const { mealId } = useParams();
  console.log("mealId from useParams:", mealId);


  const navigate = useNavigate();

  const handleCancel = () => navigate("/members/meal-planner");

  const [step, setStep] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);

  const round = (num) => (num ? Math.round(num * 10) / 10 : "N/A");

  const handleSearchChange = async (text) => {
    setSearchText(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(
          text
        )}`,
        {
          headers: {
            "x-app-id": import.meta.env.VITE_NUTRITIONIX_APP_ID,
            "x-app-key": import.meta.env.VITE_NUTRITIONIX_APP_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setSuggestions(data.common || []);
    } catch (error) {
      console.error("NutritionX search failed:", error);
      setSuggestions([]);
    }
  };


  const fetchNutritionDetails = async (foodName) => {
    try {
      const response = await fetch(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        {
          method: "POST",
          headers: {
            "x-app-id": import.meta.env.VITE_NUTRITIONIX_APP_ID,
            "x-app-key": import.meta.env.VITE_NUTRITIONIX_APP_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: foodName }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        setSelectedFood(data.foods[0]);
        setStep(2);
      }
    } catch (error) {
      console.error("Failed to fetch nutrition details:", error);
    }
  };

  const handleSelectSuggestion = (food) => {
    fetchNutritionDetails(food.food_name);
  };

  const handleAdd = () => {
    if (!selectedFood) return;

    const ingredient = {
      id: Date.now(),
      name: selectedFood.food_name,
      values: [
        selectedFood.nf_calories,
        selectedFood.nf_protein,
        selectedFood.nf_total_carbohydrate,
        selectedFood.nf_total_fat,
      ],
      serving_qty: selectedFood.serving_qty,
      serving_unit: selectedFood.serving_unit,
    };

 dispatch(addIngredientToMeal({ mealId: Number(mealId), ingredient }));


    handleCancel();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-2">Add food to meal {mealId}</h1>

      <div className="text-sm text-gray-600 mb-4">
        Step {step} of 2: {step === 1 ? "Search & Select" : "Confirm & Add"}
      </div>

      {step === 1 && (
        <>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Search for a food..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <ul className="mt-2 border rounded max-h-60 overflow-auto">
            {suggestions.map((item) => (
              <li
                key={item.food_name}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectSuggestion(item)}
              >
                {item.food_name}
              </li>
            ))}
          </ul>
        </>
      )}

      {step === 2 && selectedFood && (
        <div className="space-y-4 mt-4 border p-4 rounded-xl shadow-md bg-white">
          <h2 className="text-lg font-bold">{selectedFood.food_name}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-600">Serving Quantity</span>
              <input
                type="number"
                className="w-full border p-2 mt-1 rounded"
                value={selectedFood.serving_qty}
                onChange={(e) =>
                  setSelectedFood((prev) => ({
                    ...prev,
                    serving_qty: Number(e.target.value),
                  }))
                }
                min={1}
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-600">Serving Unit</span>
              <input
                type="text"
                className="w-full border p-2 mt-1 rounded"
                value={selectedFood.serving_unit}
                onChange={(e) =>
                  setSelectedFood((prev) => ({
                    ...prev,
                    serving_unit: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="text-sm text-gray-700 mt-4 border-t pt-4">
            <p>
              <strong>Calories:</strong> {round(selectedFood.nf_calories)} kcal
            </p>
            <p>
              <strong>Protein:</strong> {round(selectedFood.nf_protein)} g
            </p>
            <p>
              <strong>Carbohydrates:</strong>{" "}
              {round(selectedFood.nf_total_carbohydrate)} g
            </p>
            <p>
              <strong>Fat:</strong> {round(selectedFood.nf_total_fat)} g
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Add to Meal
            </button>

            <button
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-gray-800 underline w-full sm:w-auto"
            >
              ← Back to Search
            </button>
          </div>
        </div>
      )}

      <button onClick={handleCancel} className="mt-6 text-red-600 underline">
        Cancel
      </button>
    </div>
  );
}
