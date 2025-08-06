import { useRef, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";

import TotalMacros from "../../components/mealPlanner/TotalMacros";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  FaCalendarAlt,
  FaLongArrowAltLeft,
  FaLongArrowAltRight,
} from "react-icons/fa";

import MealBlock from "../../components/mealPlanner/MealBlock";

import {
  updateMealName,
  updateMealTime,
  insertMealAtIndex,
  deleteMeal,
  addIngredientToMeal,
  editIngredientInMeal,
  deleteIngredientFromMeal,
} from "../../redux/mealsSlice";

import { toggleFavoriteMeal } from "../../redux/favoritesSlice";

import PieChart from "../../components/PieChart";

export default function MealPlanner() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const assignedPlanByDay = useSelector(
    (state) => state.nutrition.assignedPlanByDay
  );
  const weekDays = useSelector((state) => state.nutrition.weekDays);
  const meals = useSelector((state) => state.meals.meals);

  const favoriteMeals = useSelector((state) => state.favorites.favoriteMeals);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [mealsTotals, setMealsTotals] = useState([]);
  const calendarRef = useRef(null);
  const [, setNoMacrosFound] = useState(false);

  const formatISODate = (date) => date.toISOString().split("T")[0];

  const macrosForSelectedDate = useMemo(() => {
    if (
      !Array.isArray(weekDays) ||
      !assignedPlanByDay ||
      Object.keys(assignedPlanByDay).length === 0
    ) {
      return null;
    }

    const currentISO = formatISODate(currentDate);

    const matchingIndex = weekDays.findIndex((day) => {
      const dayISO = new Date(day.date).toISOString().split("T")[0];
      return dayISO === currentISO;
    });

    if (matchingIndex === -1) return null;

    const macros = assignedPlanByDay[matchingIndex];
    if (!macros) return null;

    return [
      macros.kcal ?? macros.calories ?? 0,
      macros.protein ?? 0,
      macros.carbs ?? 0,
      macros.fat ?? 0,
    ];
  }, [currentDate, assignedPlanByDay, weekDays]);

  useEffect(() => {
    if (!macrosForSelectedDate) {
      setNoMacrosFound(true);
    } else {
      setNoMacrosFound(false);
    }
  }, [macrosForSelectedDate]);

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

  const remainingMacros = macrosForSelectedDate
    ? macrosForSelectedDate.map((val, idx) => val - (grandTotals[idx] || 0))
    : [0, 0, 0, 0];

  function handleMealNameChange(mealId, newName) {
    dispatch(updateMealName({ mealId, newName }));
  }

  const handleTimeChange = (mealId, newTime) => {
    dispatch(updateMealTime({ mealId, newTime }));
  };

  const handleAddMeal = (insertIndex) => {
    const newMeal = {
      id: uuidv4(),
      time: "08:00h",
      ingredients: [],
    };
    dispatch(insertMealAtIndex({ index: insertIndex, meal: newMeal }));
  };

  const handleDeleteMeal = (mealId) => {
    if (meals.length <= 1) {
      alert("You cannot delete the last remaining meal.");
      return;
    }
    dispatch(deleteMeal(mealId));
    setMealsTotals((prev) => prev.filter((_, i) => meals[i]?.id !== mealId));
  };

  const handleAddIngredient = (mealId, ingredient) => {
    dispatch(addIngredientToMeal({ mealId, ingredient }));
  };

  useEffect(() => {
    if (!macrosForSelectedDate) {
      setNoMacrosFound(true);
    } else {
      setNoMacrosFound(false);
    }
  }, [macrosForSelectedDate]);

  const handleEditIngredient = (
    mealIndex,
    ingredientIndex,
    updatedIngredient
  ) => {
    dispatch(
      editIngredientInMeal({ mealIndex, ingredientIndex, updatedIngredient })
    );
  };

  const handleDeleteIngredient = (mealId, ingredientId) => {
    dispatch(deleteIngredientFromMeal({ mealId, ingredientId }));
  };

  const toggleFavoriteMealHandler = (mealId) => {
    dispatch(toggleFavoriteMeal(mealId));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl text-center font-bold mb-6">Meal Planner</h1>

      {!macrosForSelectedDate ? (
        <div className="text-center p-6 bg-yellow-100 text-yellow-900 rounded border border-yellow-300">
          <p>No macros found for {formatDate(currentDate)}.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate("/members/create-nutrition-plan")}
          >
            Go to Nutrition Planner
          </button>
        </div>
      ) : (
        <>

          <div className="relative">
            <div className="border border-white-700 rounded">
              <div className="flex justify-between p-4">
                <p className="text-xl font-semibold">Your Meals for:</p>
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

            <div className="bg-red-900 flex text-white absolute top-17 right-10 rounded overflow-hidden">
              {[
                {
                  label: "Calories",
                  unit: "kcal",
                  value: macrosForSelectedDate[0],
                },
                {
                  label: "Proteins",
                  unit: "grams",
                  value: macrosForSelectedDate[1],
                },
                { label: "Carbs", unit: "grams", value: macrosForSelectedDate[2] },
                { label: "Fats", unit: "grams", value: macrosForSelectedDate[3] },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center text-white p-2 w-20 border-white ${
                    idx !== 0 ? "border-l" : ""
                  }`}
                >
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-lg">{item.value}</p>
                  <p className="text-xs">{item.unit}</p>
                </div>
              ))}
            </div>

            {meals.map((meal, idx) => (
              <MealBlock
                key={meal.id}
                mealIndex={idx}
                mealId={meal.id}
                mealName={meal.name}
                mealTime={meal.time}
                onNameChange={handleMealNameChange}
                onTimeChange={handleTimeChange}
                ingredients={meal.ingredients}
                onAddMeal={() => handleAddMeal(idx)}
                onEditIngredient={handleEditIngredient}
                onMealTotalChange={(totals) =>
                  handleMealTotalChange(idx, totals)
                }
                onDelete={() => handleDeleteMeal(meal.id)}
                onDeleteIngredient={handleDeleteIngredient}
                onAddIngredient={(ingredient) =>
                  handleAddIngredient(meal.id, ingredient)
                }
                favoriteMeals={favoriteMeals}
                toggleFavoriteMeal={toggleFavoriteMealHandler}
              />
            ))}
          </div>

          {/* Totals and Remaining */}
          <div className="flex flex-col items-end overflow-hidden pl-4 mt-4">
            <TotalMacros label="Eaten macros:" values={grandTotals} />
            <TotalMacros label="Daily macros:" values={macrosForSelectedDate} />
            <TotalMacros label="Remaining macros:" values={remainingMacros} />
          </div>
        </>
      )}

      <PieChart
        protein={grandTotals[1]}
        carbs={grandTotals[2]}
        fat={grandTotals[3]}
      />
    </div>
  );
}
