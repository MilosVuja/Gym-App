import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import TabSwitcher from "../../components/common/TabSwitcher";
import SearchIngredientsList from "../../components/common/SearchIngredientList";
import FavoriteIngredientsList from "../../components/common/FavoriteIngredientsList";
import FavoriteMealsPanel from "../../components/common/FavoriteMealsPanel";
import MealBlock from "../../components/mealPlanner/MealBlock";

import { getFullUnitName } from "../../utilities/fullUnitNames";

import { addIngredientToMeal } from "../../redux/mealsSlice";
import { toggleFavoriteIngredient } from "../../redux/favoritesSlice";

export default function IngredientPicker() {
  const dispatch = useDispatch();
  const { mealId } = useParams();
  const navigate = useNavigate();

  const meals = useSelector((state) => state.meals.meals || []);
  const favoriteIngredients = useSelector(
    (state) => state.favorites.favoriteIngredients || []
  );
  const favoriteMeals = useSelector(
    (state) => state.favorites.favoriteMeals || []
  );

  const meal = meals.find((m) => m.id === Number(mealId));

  const [activeTab, setActiveTab] = useState("addToMeal");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [servingQty, setServingQty] = useState("1.0");
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedFavoriteMeal, setSelectedFavoriteMeal] = useState(null);

  const [showMakeFavoriteMeal, setShowMakeFavoriteMeal] = useState(false);

  const [newFavoriteMealName, setNewFavoriteMealName] = useState("");
  const [newFavoriteMealIngredients, setNewFavoriteMealIngredients] = useState(
    []
  );

  const originalMacrosRef = useRef({
    nf_calories: 0,
    nf_protein: 0,
    nf_total_carbohydrate: 0,
    nf_total_fat: 0,
    serving_weight_grams: 1,
  });

  const tabs = [
    { id: "addToMeal", label: "Add to Meal" },
    { id: "addToFavorites", label: "Add to Favorites" },
    { id: "addToFavoriteMeals", label: "Add to Favorite Meals" },
  ];

  const showMealBlock = !["addToMeal", "addToFavorites"].includes(activeTab);

  const setFoodFromNutrition = (food) => {
    originalMacrosRef.current = {
      nf_calories: food.nf_calories || 0,
      nf_protein: food.nf_protein || 0,
      nf_total_carbohydrate: food.nf_total_carbohydrate || 0,
      nf_total_fat: food.nf_total_fat || 0,
      serving_weight_grams: food.serving_weight_grams || 1,
    };

    setSelectedFood({
      ...food,
      nf_calories: food.nf_calories || 0,
      nf_protein: food.nf_protein || 0,
      nf_total_carbohydrate: food.nf_total_carbohydrate || 0,
      nf_total_fat: food.nf_total_fat || 0,
      serving_unit: (food.serving_unit || "").toLowerCase(),
      alt_measures: food.alt_measures || [],
      serving_weight_grams: food.serving_weight_grams || 1,
    });

    setSelectedUnitIndex(0);
    setServingQty("1.0");
    setSelectedMeals([]);
    setComment("");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      const fetchSuggestions = async () => {
        if (!searchText || searchText.length < 2) {
          setSuggestions([]);
          return;
        }
        try {
          const res = await fetch(
            `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(
              searchText
            )}`,
            {
              headers: {
                "x-app-id": import.meta.env.VITE_NUTRITIONIX_APP_ID,
                "x-app-key": import.meta.env.VITE_NUTRITIONIX_APP_KEY,
                "Content-Type": "application/json",
              },
            }
          );
          if (!res.ok) throw new Error("Search failed");
          const data = await res.json();
          setSuggestions(data.common || []);
        } catch (err) {
          console.error("Nutritionix search error:", err);
          setSuggestions([]);
        }
      };
      fetchSuggestions();
    }, 350);

    return () => clearTimeout(handler);
  }, [searchText]);

  const fetchNutritionDetails = async (foodName) => {
    try {
      const res = await fetch(
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
      if (!res.ok) throw new Error("Nutrition fetch failed");
      const data = await res.json();
      if (data.foods && data.foods.length) {
        setFoodFromNutrition(data.foods[0]);
      }
    } catch (err) {
      console.error("Failed to fetch nutrition details:", err);
    }
  };

  const handleSelectSuggestion = (food) => {
    fetchNutritionDetails(food.food_name);
  };

  const handleUnitChange = (e) => {
    const newIndex = Number(e.target.value);
    const newMeasure = selectedFood.alt_measures?.[newIndex];
    if (!newMeasure) return;

    const unit = newMeasure.measure.toLowerCase();
    const newWeight = newMeasure.serving_weight || 1;

    const isGramUnit = unit.includes("gram") || unit === "g";
    const suggestedQty = isGramUnit ? 100 : 1.0;

    const base = originalMacrosRef.current;

    const ratio = isGramUnit
      ? suggestedQty / 100
      : (newWeight / (selectedFood.alt_measures?.[0]?.serving_weight || 1)) *
        suggestedQty;

    setSelectedFood((prev) => ({
      ...prev,
      serving_unit: unit,
      serving_weight_grams: newWeight,
      nf_calories: Math.round(base.nf_calories * ratio),
      nf_protein: Math.round(base.nf_protein * ratio),
      nf_total_carbohydrate: Math.round(base.nf_total_carbohydrate * ratio),
      nf_total_fat: Math.round(base.nf_total_fat * ratio),
    }));

    setServingQty(isGramUnit ? "100" : "1.0");
    setSelectedUnitIndex(newIndex);
  };

  const getScaledMacro = (val) => {
    if (!selectedFood) return 0;
    const qtyNum = parseFloat(servingQty) || 1;
    const totalGrams =
      selectedFood.serving_unit === "g"
        ? qtyNum
        : qtyNum * (selectedFood.serving_weight_grams || 1);

    const baseGrams = originalMacrosRef.current.serving_weight_grams || 1;
    const raw = (val / baseGrams) * totalGrams;
    return Math.round(raw);
  };

  const toggleMealCheckbox = (id) => {
    setSelectedMeals((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAddToFavoritesTab = activeTab === "addToFavorites";
  const isAddToFavoriteMealsTab = activeTab === "addToFavoriteMeals";
  const isAddToMealTab = activeTab === "addToMeal";

  const addButtonLabel = isAddToFavoritesTab
    ? "Save as Favorite"
    : isAddToFavoriteMealsTab
    ? selectedFavoriteMeal
      ? `Add to ${
          selectedFavoriteMeal.customName ||
          selectedFavoriteMeal.name ||
          "Favorite Meal"
        }`
      : "Select a Favorite Meal"
    : "Add to Meal/s";

  const handleAdd = () => {
    if (!selectedFood || Number(servingQty) <= 0) return;

    const ingredient = {
      id: uuidv4(),
      name: selectedFood.food_name || selectedFood.name || "Ingredient",
      values: [
        getScaledMacro(selectedFood.nf_calories),
        getScaledMacro(selectedFood.nf_protein),
        getScaledMacro(selectedFood.nf_total_carbohydrate),
        getScaledMacro(selectedFood.nf_total_fat),
      ],
      quantity: servingQty,
      unit: selectedFood.serving_unit,
      comment,
    };

    if (isAddToFavoritesTab) {
      dispatch(
        toggleFavoriteIngredient({
          ...selectedFood,
          id: selectedFood.id || ingredient.id,
          serving_qty: Number(servingQty),
          serving_unit: selectedFood.serving_unit,
          nf_calories: getScaledMacro(selectedFood.nf_calories),
          nf_protein: getScaledMacro(selectedFood.nf_protein),
          nf_total_carbohydrate: getScaledMacro(
            selectedFood.nf_total_carbohydrate
          ),
          nf_total_fat: getScaledMacro(selectedFood.nf_total_fat),
          comment,
        })
      );
      return;
    }

    if (isAddToFavoriteMealsTab) {
      if (!selectedFavoriteMeal) {
        return;
      }
      dispatch({
        type: "favorites/addIngredientToFavoriteMeal",
        payload: {
          mealId: selectedFavoriteMeal.id,
          ingredient,
        },
      });
      return;
    }

    if (selectedMeals.length === 0) {
      dispatch(addIngredientToMeal({ mealId: Number(mealId), ingredient }));
    } else {
      selectedMeals.forEach((id) => {
        dispatch(addIngredientToMeal({ mealId: id, ingredient }));
      });
    }

    navigate("/members/meal-planner");
  };

  const handleSelectFavoriteMeal = (meal) => {
    setSelectedFavoriteMeal(meal);
  };

  const handleNewMealNameChange = (mealId, newName) => {
    setNewFavoriteMealName(newName);
  };

  const handleNewMealIngredientEdit = (
    mealIndex,
    ingredientIndex,
    updatedIngredient
  ) => {
    setNewFavoriteMealIngredients((prev) => {
      const copy = [...prev];
      copy[ingredientIndex] = updatedIngredient;
      return copy;
    });
  };

  const handleNewMealIngredientDelete = (mealId, ingredientId) => {
    setNewFavoriteMealIngredients((prev) =>
      prev.filter((ing) => ing.id !== ingredientId)
    );
  };

  const handleSaveNewFavoriteMeal = () => {
    if (!newFavoriteMealName.trim()) {
      alert("Please enter a name for your favorite meal.");
      return;
    }

    const newMeal = {
      id: uuidv4(),
      customName: newFavoriteMealName.trim(),
      ingredients: newFavoriteMealIngredients,
    };

    dispatch({
      type: "favorites/addFavoriteMeal",
      payload: newMeal,
    });

    setNewFavoriteMealName("");
    setNewFavoriteMealIngredients([]);
    setShowMakeFavoriteMeal(false);
  };

  const handleCancelNewFavoriteMeal = () => {
    setShowMakeFavoriteMeal(false);
    setNewFavoriteMealName("");
    setNewFavoriteMealIngredients([]);
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

  const unitMap = {
    g: "grams",
    gram: "grams",
    ml: "milliliters",
    tbsp: "tablespoons",
    tsp: "teaspoons",
    oz: "ounces",
    lb: "pounds",
    piece: "piece",
    cup: "cups",
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl text-center font-bold mb-6">
        Add ingredient — <span className="italic">{meal?.name || "Meal"}</span>
      </h1>

      <div className="mb-4">
        <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 border rounded p-4">
          <h3 className="font-semibold mb-2">Search</h3>
          <SearchIngredientsList
            searchText={searchText}
            onSearchTextChange={setSearchText}
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            unitMap={unitMap}
          />
          <p className="text-xs italic text-gray-500 mt-2">
            Tip: search by ingredient name.
          </p>
        </div>

        <div className="col-span-1 border rounded p-4">
          {isAddToFavoritesTab && (
            <>
              <h3 className="font-semibold mb-2">Favorite Ingredients</h3>
              <FavoriteIngredientsList favorites={favoriteIngredients} />
            </>
          )}

          {isAddToFavoriteMealsTab && (
            <>
              <h3 className="font-semibold mb-2">Favorite Meals</h3>

              <button
                className="p-2 mb-2 rounded text-white bg-green-600 hover:bg-green-700"
                onClick={() => setShowMakeFavoriteMeal(true)}
              >
                Add your favorite meal
              </button>

              <FavoriteMealsPanel
                favorites={favoriteMeals}
                onSelectMeal={handleSelectFavoriteMeal}
              />
            </>
          )}
        </div>

        <div className="col-span-1 border rounded p-4 w-100">
          {selectedFood ? (
            <>
              <h2 className="text-lg capitalize text-center font-bold">
                {selectedFood.food_name}
              </h2>

              <h3 className="text-center my-6">Your quantity</h3>

              <div className="flex gap-5 items-center justify-center">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={
                    selectedFood?.serving_unit
                      ?.toLowerCase()
                      .includes("gram") ||
                    selectedFood?.serving_unit?.toLowerCase() === "g"
                      ? parseFloat(servingQty) === 100
                        ? "100"
                        : servingQty % 1 === 0
                        ? parseInt(servingQty)
                        : servingQty
                      : "1.0"
                  }
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
                      {getFullUnitName(measure.measure)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-500 text-center mb-6">
                  {selectedFood.serving_unit === "g"
                    ? `You're entering ${Math.round(servingQty)} grams`
                    : `1 ${getFullUnitName(
                        selectedFood.serving_unit
                      )} = ${Math.round(selectedFood.serving_weight_grams)}g`}
                </p>
              </div>

              <div className="text-sm text-white font-mono mb-6">
                {[
                  ["Calories:", getScaledMacro(selectedFood.nf_calories)],
                  ["Protein:", getScaledMacro(selectedFood.nf_protein)],
                  ["Carbs:", getScaledMacro(selectedFood.nf_total_carbohydrate)],
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
                <input
                  type="text"
                  placeholder="Add comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-2 px-3 py-1 w-full rounded border text-sm mt-6"
                />
              </div>

              {isAddToMealTab && (
                <div className="mb-10">
                  <p className="font-semibold mb-2 text-center">Add to meal(s)</p>
                  <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-auto">
                    {meals.map((m) => (
                      <label key={m.id} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            selectedMeals.includes(m.id) ||
                            (!selectedMeals.length && m.id === Number(mealId))
                          }
                          onChange={() => toggleMealCheckbox(m.id)}
                        />
                        <span>{m.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {isAddToFavoriteMealsTab && (
                <div className="mb-3 text-center">
                  <p className="text-sm text-gray-600">Selected favorite meal:</p>
                  <p className="font-medium">
                    {selectedFavoriteMeal?.customName ||
                      selectedFavoriteMeal?.name ||
                      "—"}
                  </p>
                </div>
              )}

              <button
                onClick={handleAdd}
                disabled={
                  (isAddToFavoriteMealsTab && !selectedFavoriteMeal) ||
                  !selectedFood ||
                  Number(servingQty) <= 0
                }
                className={`w-full py-2 rounded text-white ${
                  (isAddToFavoriteMealsTab && !selectedFavoriteMeal) ||
                  !selectedFood ||
                  Number(servingQty) <= 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {addButtonLabel}
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>
                Select an ingredient from the search or favorites to view details.
              </p>
            </div>
          )}
        </div>
      </div>

      {showMakeFavoriteMeal && showMealBlock && (
        <div className="mt-8 border rounded p-4">
          <MealBlock
            mealName={newFavoriteMealName}
            ingredients={newFavoriteMealIngredients}
            onNameChange={handleNewMealNameChange}
            onEditIngredient={handleNewMealIngredientEdit}
            onDeleteIngredient={handleNewMealIngredientDelete}
            onSave={handleSaveNewFavoriteMeal}
            onCancel={handleCancelNewFavoriteMeal}
            isNew
            isFavoriteMode={true}
          />
        </div>
      )}
    </div>
  );
}
