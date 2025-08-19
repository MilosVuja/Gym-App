import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { getFullUnitName } from "../../../utilities/fullUnitNames";

export default function IngredientEditModal({ ingredient, onClose, onSave }) {
  const modalRef = useRef();

  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [servingQty, setServingQty] = useState("");

  const originalMacrosRef = useRef({
    nf_calories: 0,
    nf_protein: 0,
    nf_total_carbohydrate: 0,
    nf_total_fat: 0,
    serving_weight_grams: 1,
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (!ingredient?.name) return;
    axios
      .post(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        { query: ingredient.name },
        {
          headers: {
            "x-app-id": import.meta.env.VITE_NUTRITIONIX_APP_ID,
            "x-app-key": import.meta.env.VITE_NUTRITIONIX_APP_KEY,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res.data.foods && res.data.foods.length > 0) {
          const food = res.data.foods[0];
          originalMacrosRef.current = {
            nf_calories: food.nf_calories || 0,
            nf_protein: food.nf_protein || 0,
            nf_total_carbohydrate: food.nf_total_carbohydrate || 0,
            nf_total_fat: food.nf_total_fat || 0,
            serving_weight_grams: food.serving_weight_grams || 1,
          };
          setSelectedFood({
            ...food,
            alt_measures: food.alt_measures || [],
            serving_unit: (food.serving_unit || "").toLowerCase(),
          });
          setSelectedUnitIndex(0);
          setServingQty("1.0");
        }
      })
      .catch(console.error);
  }, [ingredient]);

  const handleUnitChange = (e) => {
    const newIndex = Number(e.target.value);
    if (!selectedFood) return;
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
    return Math.round((val / baseGrams) * totalGrams);
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

  const handleSave = () => {
    if (!selectedFood) return;
    onSave({
      ...ingredient,
      quantity: servingQty,
      unit: selectedFood.serving_unit,
      values: [
        getScaledMacro(selectedFood.nf_calories),
        getScaledMacro(selectedFood.nf_protein),
        getScaledMacro(selectedFood.nf_total_carbohydrate),
        getScaledMacro(selectedFood.nf_total_fat),
      ],
    });
  };

  return (
    <div className="fixed top-60 z-50 flex items-start justify-center pt-12">
      <div
        ref={modalRef}
        className="bg-gray-900 text-white border border-gray-700 rounded-lg shadow-xl px-5 py-4 w-[300px]"
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg capitalize font-bold text-center flex-1">
            {ingredient?.name || "Ingredient"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-red-500">
            <IoClose size={20} />
          </button>
        </div>

        {selectedFood && (
          <>
            <h3 className="text-center mt-4 mb-1">Your quantity</h3>
            <div className="flex gap-4 items-center justify-center mb-4">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={servingQty === 0 ? "" : servingQty}
                onChange={handleServingQtyChange}
                onBlur={handleServingQtyBlur}
                className="w-20 rounded border p-1 text-center text-black"
              />
              <span>servings of</span>
              <select
                value={selectedUnitIndex}
                onChange={handleUnitChange}
                className="w-32 rounded border p-1 text-black"
              >
                {selectedFood.alt_measures?.map((unit, idx) => (
                  <option key={idx} value={idx}>
                    {getFullUnitName(unit.measure)}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-white font-mono mb-5">
              {[
                ["Calories:", getScaledMacro(selectedFood.nf_calories)],
                ["Protein:", getScaledMacro(selectedFood.nf_protein)],
                ["Carbs:", getScaledMacro(selectedFood.nf_total_carbohydrate)],
                ["Fat:", getScaledMacro(selectedFood.nf_total_fat)],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2 justify-between">
                  <div className="w-20 text-left">{label}</div>
                  <div className="w-10 text-right">{val}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-1 rounded"
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
