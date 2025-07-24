import { useRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt,
  FaLongArrowAltLeft,
  FaLongArrowAltRight,
} from "react-icons/fa";
import MealBlock from "../../components/mealPlanner/MealBlock";

export default function MealPlanner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const calendarRef = useRef(null);

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
        <MealBlock />

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

        <MealBlock />
        <MealBlock />
        <MealBlock />
        <MealBlock />
        <MealBlock />
      </div>
      <div className="flex flex-col items-end overflow-hidden pl-4">
        <div className="flex text-white text-center space-x-2 py-1">
          <p className="font-semibold">Eaten macros:</p>
          <p className="flex-1 min-w-[50px] ml-30">200</p>
          <p className="flex-1 min-w-[50px] ml-6">50</p>
          <p className="flex-1 min-w-[50px] ml-6">0</p>
          <p className="flex-1 min-w-[50px] ml-6 mr-4">0</p>
        </div>
        <div className="flex items-center text-white text-center space-x-2 py-1">
          <p className="font-semibold">Daily macros:</p>
          <p className="flex-1 min-w-[50px] ml-30">200</p>
          <p className="flex-1 min-w-[50px] ml-6">50</p>
          <p className="flex-1 min-w-[50px] ml-6">0</p>
          <p className="flex-1 min-w-[50px] ml-6 mr-4">0</p>
        </div>
        <div className="flex items-center text-white text-center space-x-2 py-1">
          <p className="font-semibold">Remaining macros:</p>
          <p className="flex-1 min-w-[50px] ml-30">200</p>
          <p className="flex-1 min-w-[50px] ml-6">50</p>
          <p className="flex-1 min-w-[50px] ml-6">0</p>
          <p className="flex-1 min-w-[50px] ml-6 mr-4">0</p>
        </div>
      </div>
    </div>
  );
}
