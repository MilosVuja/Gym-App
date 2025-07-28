import { useRef, useEffect, useState } from "react";
import FavoritesButton from "../common/FavoritesButton";
import { FaTrashAlt } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

export default function MealHeader({
  mealId,
  mealName: initialName,
  mealTime: initialTime,
  onDelete,
  onAddMeal,
  favoriteMeals = [],
  toggleFavoriteMeal,
}) {
  const [mealName, setMealName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);

  const [hour, setHour] = useState(() => {
    const match = initialTime.match(/^(\d{2}):(\d{2})h$/);
    return match ? match[1] : "00";
  });
  const [minute, setMinute] = useState(() => {
    const match = initialTime.match(/^(\d{2}):(\d{2})h$/);
    return match ? match[2] : "00";
  });

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const isFavorite = favoriteMeals.includes(mealId);

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const composedTime = `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}h`;

  const validateAndSetHour = (val) => {
    if (/^\d{0,2}$/.test(val)) {
      const num = Number(val);
      if (num >= 0 && num <= 23) {
        setHour(val.padStart(2, "0"));
        setError("");
      } else {
        setError("Hour must be 00–23");
      }
    }
  };

  const validateAndSetMinute = (val) => {
    if (/^\d{0,2}$/.test(val)) {
      const num = Number(val);
      if (num >= 0 && num <= 59) {
        setMinute(val.padStart(2, "0"));
        setError("");
      } else {
        setError("Minute must be 00–59");
      }
    }
  };

  const handleTimeBlur = () => {
    if (!error) {
      setIsEditingTime(false);
    }
  };

  return (
    <div className="flex justify-between border border-white-700 rounded">
      <div className="flex flex-col text-white p-3">
        <div className="flex gap-4 items-center">
          {isEditingName ? (
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              autoFocus
              className="border px-2 py-1 rounded text-black"
            />
          ) : (
            <p
              className="text-2xl cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {mealName}
            </p>
          )}

          {isEditingTime ? (
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={hour}
                onChange={(e) => validateAndSetHour(e.target.value)}
                onBlur={handleTimeBlur}
                maxLength={2}
                autoFocus
                className="border px-2 py-1 rounded text-black w-12 text-center"
              />
              <span>:</span>
              <input
                type="text"
                value={minute}
                onChange={(e) => validateAndSetMinute(e.target.value)}
                onBlur={handleTimeBlur}
                maxLength={2}
                className="border px-2 py-1 rounded text-black w-12 text-center"
              />
              <span>h</span>
            </div>
          ) : (
            <p
              onClick={() => {
                setIsEditingTime(true);
                setError("");
              }}
              className="cursor-pointer"
            >
              {composedTime}
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

        <div className="relative flex gap-4 items-center mt-2">
          <button
            className="border border-white text-white py-1 px-3 rounded text-xs"
            onClick={onAddMeal}
          >
            Add Meal
          </button>

          <button onClick={() => setMenuOpen((prev) => !prev)}>
            <BsThreeDots className="text-white-500" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-10 top-10 bg-white shadow-lg rounded z-50 w-52"
            >
              <ul className="text-sm text-gray-700">
                <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">
                  Quick Add Calories
                </li>
                <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">
                  Copy from Yesterday
                </li>
                <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">
                  Copy from Date
                </li>
                <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">
                  Copy to Date
                </li>
              </ul>
            </div>
          )}

          <button onClick={onDelete}>
            <FaTrashAlt className="text-white-500" />
          </button>
        </div>
      </div>
      <div className="flex items-end p-2">
        <FavoritesButton
          isFavorite={isFavorite}
          onToggle={() => toggleFavoriteMeal(mealId)}
        />
      </div>
    </div>
  );
}
