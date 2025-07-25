import { useRef, useEffect, useState } from "react";
import TotalMacros from "../../components/mealPlanner/TotalMacros";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt,
  FaLongArrowAltLeft,
  FaLongArrowAltRight,
} from "react-icons/fa";
import MealBlock from "../../components/mealPlanner/MealBlock";

export default function MealPlanner() {
  const [macroValues, setMacroValues] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const calendarRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("nutritionPlanDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const macros = parsed.appliedCustomMacros || parsed.recommendedMacros;

        if (macros) {
          setMacroValues([
            macros.calories || 0,
            macros.protein || 0,
            macros.carbs || 0,
            macros.fat || 0,
          ]);
        }
      } catch (err) {
        console.error("Error reading macros from localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const formatDate = (date) => {
    const options = { weekday: "long" };
    const weekday = new Intl.DateTimeFormat("en-US", options).format(date);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${weekday}, ${day}.${month}.${year}`;
  };

  const goToPreviousDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const [allMealsIngredients, setAllMealsIngredients] = useState([
    [
      { id: 0, name: "Egg", values: [100, 40, 10, 5] },
      { id: 1, name: "Chicken Breast", values: [100, 40, 10, 5] },
      { id: 2, name: "Rice", values: [50, 20, 5, 2] },
    ],
    [{ id: 3, name: "Salmon", values: [200, 60, 0, 10] }],
    [{ id: 4, name: "Avocado", values: [200, 60, 0, 10] }],
    [
      { id: 5, name: "Egg", values: [100, 40, 10, 5] },
      { id: 6, name: "Chicken Breast", values: [100, 40, 10, 5] },
      { id: 7, name: "Rice", values: [50, 20, 5, 2] },
    ],
  ]);

  const [mealsTotals, setMealsTotals] = useState([]);

  const handleMealTotalChange = (mealIndex, totals) => {
    setMealsTotals((prev) => {
      const updated = [...prev];
      const prevTotals = updated[mealIndex];

      if (prevTotals && prevTotals.every((val, idx) => val === totals[idx])) {
        return prev;
      }

      updated[mealIndex] = totals;
      return updated;
    });
  };

  const grandTotals = [0, 0, 0, 0];
  mealsTotals.forEach((totals) => {
    if (totals) {
      totals.forEach((val, idx) => {
        grandTotals[idx] += val;
      });
    }
  });

  const remainingMacros = macroValues
    ? macroValues.map((val, idx) => val - (grandTotals[idx] || 0))
    : [0, 0, 0, 0];

  const handleDeleteMeal = (mealIndex) => {
    const updatedMeals = allMealsIngredients.filter((_, i) => i !== mealIndex);

    setAllMealsIngredients(updatedMeals);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl text-center font-bold mb-6">Meal Planner</h1>
      <div className="relative">
        <div className="border border-white-700 rounded">
          <div className="flex justify-between p-4">
            <div className="flex items-center">
              <p className="text-xl font-semibold">Your Meals for:</p>
            </div>
            <div className="flex items-center space-x-4 relative mr-30">
              <button onClick={goToPreviousDay}>
                <FaLongArrowAltLeft />
              </button>
              <span className="font-medium w-[200px] inline-block text-center">
                {formatDate(currentDate)}
              </span>
              <button onClick={goToNextDay}>
                <FaLongArrowAltRight />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setIsCalendarOpen((open) => !open)}>
                <FaCalendarAlt className="text-white-500" />
              </button>
              {isCalendarOpen && (
                <div
                  ref={calendarRef}
                  className="absolute z-50 mt-2 bg-white shadow-lg rounded"
                  style={{
                    transform: "scale(0.9)",
                    transformOrigin: "top left",
                  }}
                >
                  <DatePicker
                    selected={currentDate}
                    onChange={(date) => {
                      setCurrentDate(date);
                      setIsCalendarOpen(false);
                    }}
                    inline
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-red-500 flex text-white absolute top-17 right-0.5">
          <div className="flex flex-col items-center text-white p-4 w-20 border-r-4 border-white">
            <p>Calories</p>
            <p>kcal</p>
          </div>
          <div className="flex flex-col items-center text-white p-4 w-20 border-r-4 border-white">
            <p>Proteins</p>
            <p>g</p>
          </div>
          <div className="flex flex-col items-center text-white p-4 w-20 border-r-4 border-white">
            <p>Carbs</p>
            <p>g</p>
          </div>
          <div className="flex flex-col items-center text-white p-4 w-20 border-r-1 border-white">
            <p>Fats</p>
            <p>g</p>
          </div>
        </div>
        {allMealsIngredients.map((ingredients, idx) => (
          <MealBlock
            key={idx}
            ingredients={ingredients}
            onMealTotalChange={(totals) => handleMealTotalChange(idx, totals)}
            onDelete={() => handleDeleteMeal(idx)}
          />
        ))}
      </div>
      <div className="flex flex-col items-end overflow-hidden pl-4">
        <TotalMacros label="Eaten macros:" values={grandTotals} />
        {macroValues && (
          <TotalMacros label="Daily Macros" values={macroValues} />
        )}

        <TotalMacros label="Remaining Macros" values={remainingMacros} />
      </div>
    </div>
  );
}
