import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { addIngredientToMeal } from "../../redux/mealsSlice";

export default function IngredientPicker() {
  const dispatch = useDispatch();
  const { mealId } = useParams();
  const navigate = useNavigate();

  const meals = useSelector((state) => state.meals.meals);

  const handleCancel = () => navigate("/members/meal-planner");

  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [servingQty, setServingQty] = useState("1.0");
  const [selectedMeals, setSelectedMeals] = useState([]);

  const originalMacrosRef = useRef({
    nf_calories: 0,
    nf_protein: 0,
    nf_total_carbohydrate: 0,
    nf_total_fat: 0,
  });

  const handleSearchChange = async (text) => {
    setSearchText(text);
    setSelectedFood(null);
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
        const food = data.foods[0];

        originalMacrosRef.current = {
          nf_calories: food.nf_calories,
          nf_protein: food.nf_protein,
          nf_total_carbohydrate: food.nf_total_carbohydrate,
          nf_total_fat: food.nf_total_fat,
        };

        setSelectedFood(food);
        setSelectedUnitIndex(0);
        setServingQty(1);
        setSelectedMeals([]);
      }
    } catch (error) {
      console.error("Failed to fetch nutrition details:", error);
    }
  };

  const handleSelectSuggestion = (food) => {
    fetchNutritionDetails(food.food_name);
  };

  const handleUnitChange = (e) => {
    const newIndex = Number(e.target.value);
    const newMeasure = selectedFood.alt_measures?.[newIndex];
    if (!newMeasure) return;

    const newWeight = newMeasure.serving_weight || 1;
    const baseWeight = selectedFood.alt_measures?.[0]?.serving_weight || 1;
    const ratio = newWeight / baseWeight;

    const base = originalMacrosRef.current;

    setSelectedFood((prev) => ({
      ...prev,
      serving_unit: newMeasure.measure,
      serving_weight_grams: newWeight,
      nf_calories: Math.round(base.nf_calories * ratio),
      nf_protein: Math.round(base.nf_protein * ratio),
      nf_total_carbohydrate: Math.round(base.nf_total_carbohydrate * ratio),
      nf_total_fat: Math.round(base.nf_total_fat * ratio),
    }));

    setSelectedUnitIndex(newIndex);
  };

  const handleServingQtyChange = (e) => {
    const val = e.target.value;
    if (/^\d*\.?\d*$/.test(val)) {
      setServingQty(val);
    }
  };

  const handleServingQtyBlur = () => {
    if (servingQty === "" || isNaN(Number(servingQty))) {
      setServingQty("1.0");
    } else {
      setServingQty(Number(servingQty).toFixed(1));
    }
  };

  const getScaledMacro = (val) => {
    if (!selectedFood) return 0;
    return Math.round(val * servingQty);
  };

  const toggleMealCheckbox = (mealId) => {
    setSelectedMeals((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  };

  const handleAdd = () => {
    if (!selectedFood || servingQty <= 0) return;

    const ingredient = {
      id: Date.now(),
      name: selectedFood.food_name,
      values: [
        getScaledMacro(selectedFood.nf_calories),
        getScaledMacro(selectedFood.nf_protein),
        getScaledMacro(selectedFood.nf_total_carbohydrate),
        getScaledMacro(selectedFood.nf_total_fat),
      ],
      quantity: servingQty,
      unit: selectedFood.serving_unit,
    };

    if (selectedMeals.length === 0) {
      dispatch(addIngredientToMeal({ mealId: Number(mealId), ingredient }));
    } else {
      selectedMeals.forEach((id) => {
        dispatch(addIngredientToMeal({ mealId: id, ingredient }));
      });
    }

    handleCancel();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-4xl text-center font-bold mb-10">
        Add food to Meal{" "}
        {String(mealId).charAt(0).toUpperCase() + String(mealId).slice(1)}
      </h1>

      <div className="flex justify-center gap-4">
        <div>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Search for ingredient..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <h2 className="mt-4 font-semibold">Matching foods:</h2>

          <div className="mt-2 max-h-[400px] overflow-auto border rounded p-2 space-y-2">
            {suggestions.map((item, idx) => (
              <div
                key={item.food_name + idx}
                onClick={() => handleSelectSuggestion(item)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold truncate max-w-xs">
                    {item.food_name}
                  </p>
                </div>
                <div className="text-sm text-gray-700 min-w-[120px] text-right">
                  {item.serving_qty || 1} {item.serving_unit || "unit"}
                </div>
              </div>
            ))}

            {suggestions.length === 0 && searchText.length >= 2 && (
              <p className="text-gray-600">No matching foods found.</p>
            )}
          </div>
        </div>
        <div
          className="w-96 border rounded p-4 shadow-md flex flex-col gap-4 top-4 h-fit"
          style={{ minHeight: 400 }}
        >
          {selectedFood ? (
            <>
              <h2 className="text-lg capitalize text-center font-bold">
                {selectedFood.food_name}
              </h2>

              <h3 className="text-center mt-4">Your quantity</h3>

              <div className="flex gap-5 items-center justify-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={servingQty}
                  onChange={handleServingQtyChange}
                  onBlur={handleServingQtyBlur}
                  placeholder="1.0"
                  className="mt-1 block w-20 rounded border p-1 text-center"
                />

                <span>servings of</span>
                <select
                  value={selectedUnitIndex}
                  onChange={handleUnitChange}
                  className="w-35 rounded border p-1"
                >
                  {selectedFood.alt_measures?.map((measure, idx) => (
                    <option style={{ color: "black" }} key={idx} value={idx}>
                      {measure.measure}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-white font-mono mb-5">
                {[
                  ["Calories:", getScaledMacro(selectedFood.nf_calories)],
                  ["Protein:", getScaledMacro(selectedFood.nf_protein)],
                  [
                    "Carbs:",
                    getScaledMacro(selectedFood.nf_total_carbohydrate),
                  ],
                  ["Fat:", getScaledMacro(selectedFood.nf_total_fat)],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <div className="w-20 text-left">
                      <span>{label}</span>
                    </div>
                    <div className="w-5 text-right">
                      <span>{val}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mb-7">
                <p className="font-semibold mb-2">Add to meal(s):</p>
                <div className="flex justify-center gap-5 max-h-48 overflow-auto">
                  {meals.map((meal) => (
                    <label
                      key={meal.id}
                      className="inline-flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedMeals.includes(meal.id) ||
                          (!selectedMeals.length && meal.id === Number(mealId))
                        }
                        onChange={() => toggleMealCheckbox(meal.id)}
                      />
                      <span>{meal.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full mb-6"
              >
                Add to Meal/s
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500 mt-20">
              <p>Select a ingrdient for the left to see nutrition info!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
