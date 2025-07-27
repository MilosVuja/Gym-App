import { useEffect, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import axios from "axios";

export default function IngredientEditModal({
  ingredient,
  units = [],
  quantity = 1,
  selectedUnitIndex = 0,
  onQtyChange,
  onUnitChange,
  onClose,
  onSave,
}) {
  const modalRef = useRef();
  const [nutritionData, setNutritionData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    if (!ingredient?.name) {
      setNutritionData(null);
      return;
    }

    setLoading(true);
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
          setNutritionData(res.data.foods[0]);
        } else {
          setNutritionData(null);
        }
      })
      .catch(() => setNutritionData(null))
      .finally(() => setLoading(false));
  }, [ingredient]);

  const safeSelectedUnitIndex =
    selectedUnitIndex >= 0 &&
    selectedUnitIndex < (nutritionData?.alt_measures?.length || units.length)
      ? selectedUnitIndex
      : 0;

  const getScaledValue = (macroKey) => {
    if (!nutritionData) return null;

    const baseWeight = nutritionData.serving_weight_grams || 100;
    const unitWeight =
      nutritionData.alt_measures?.[safeSelectedUnitIndex]?.serving_weight ||
      units?.[safeSelectedUnitIndex]?.serving_weight ||
      baseWeight;

    const ratio = ((quantity || 1) * unitWeight) / baseWeight;
    const val = nutritionData[macroKey];

    return val !== undefined && val !== null ? Math.round(val * ratio) : null;
  };

  const handleModalSave = () => {
    const updated = {
      ...ingredient,
      quantity,
      unitIndex: selectedUnitIndex,
      unit:
        units?.[selectedUnitIndex]?.measure ||
        ingredient?.alt_measures?.[selectedUnitIndex]?.measure ||
        "",
      values: [
        getScaledValue("nf_calories"),
        getScaledValue("nf_protein"),
        getScaledValue("nf_total_carbohydrate"),
        getScaledValue("nf_total_fat"),
      ],
    };

    onSave(updated);
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

        <h3 className="text-center mt-4 mb-1">Your quantity</h3>
        <div className="flex gap-4 items-center justify-center mb-4">
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={quantity || ""}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val) && val > 0) {
                onQtyChange(val);
              } else if (e.target.value === "") {
                onQtyChange("");
              }
            }}
            className="w-20 rounded border p-1 text-center text-black"
          />
          <span>servings of</span>
          <select
            value={safeSelectedUnitIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (!isNaN(idx)) onUnitChange(idx);
            }}
            className="w-32 rounded border p-1 text-black"
          >
            {(nutritionData?.alt_measures || units).length > 0 ? (
              (nutritionData?.alt_measures || units).map((unit, idx) => (
                <option key={idx} value={idx}>
                  {unit.measure}
                </option>
              ))
            ) : (
              <option value={0}>No units</option>
            )}
          </select>
        </div>

        <div className="text-sm text-white font-mono mb-5">
          {loading ? (
            <p>Loading macros...</p>
          ) : nutritionData ? (
            [
              "nf_calories",
              "nf_protein",
              "nf_total_carbohydrate",
              "nf_total_fat",
            ].map((key, idx) => {
              const label = ["Calories:", "Protein:", "Carbs:", "Fat:"][idx];
              const val = getScaledValue(key);
              return (
                <div key={label} className="flex gap-2 justify-between">
                  <div className="w-20 text-left">{label}</div>
                  <div className="w-10 text-right">
                    {val !== null ? val : "-"}
                  </div>
                </div>
              );
            })
          ) : ingredient?.values?.length === 4 ? (
            [
              ["Calories:", ingredient.values[0]],
              ["Protein:", ingredient.values[1]],
              ["Carbs:", ingredient.values[2]],
              ["Fat:", ingredient.values[3]],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-2 justify-between">
                <div className="w-20 text-left">{label}</div>
                <div className="w-10 text-right">{Math.round(val)}</div>
              </div>
            ))
          ) : (
            <p>No macro data available</p>
          )}
        </div>

        <button
          onClick={handleModalSave}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-1 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
