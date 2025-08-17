import { useRef, useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

export default function MealHeader({
  mealId,
  mealName: initialName,
  onNameChange,
  mealTime: initialTime = "08:00h",
  onTimeChange,
  onDelete,
  onAddMeal,
  isFirstMeal,
  isFavoriteMode = false,
  onCancelFavorite,
}) {
  const [mealName, setMealName] = useState(initialName || "");
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => setMealName(initialName || ""), [initialName]);

  const commitNameEdit = () => {
    setIsEditingName(false);
    onNameChange?.(mealId, (mealName || "").trim());
  };

  const cancelNameEdit = () => {
    setMealName(initialName || "");
    setIsEditingName(false);
  };

  const parseTime = (timeStr) => timeStr?.replace("h", "") || "08:00";
  const [timeValue, setTimeValue] = useState(parseTime(initialTime));
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const timeInputRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingTime && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.setSelectionRange(
        timeValue.length,
        timeValue.length
      );
    }
  }, [isEditingTime, timeValue.length]);

  const commitTimeChange = () => {
    const trimmed = timeValue.trim();
    const isValid = /^([01]?\d|2[0-3]):([0-5]\d)$/.test(trimmed);
    if (isValid) {
      const [h, m] = trimmed.split(":");
      const formatted = `${h.padStart(2, "0")}:${m}h`;
      onTimeChange?.(mealId, formatted);
      setError("");
      setIsEditingTime(false);
    } else setError("Invalid time format (HH:MM)");
  };

  const cancelTimeEdit = () => {
    setTimeValue(parseTime(initialTime));
    setIsEditingTime(false);
    setError("");
  };

  const NameEditor = (
    <input
      type="text"
      value={mealName}
      onChange={(e) => setMealName(e.target.value)}
      onBlur={commitNameEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commitNameEdit();
        else if (e.key === "Escape") cancelNameEdit();
      }}
      autoFocus
      className="border px-2 py-1 rounded text-black"
    />
  );

  const handleDeleteOrCancel = () => {
    if (isFavoriteMode && onCancelFavorite) {
      console.log("Cancel triggered for favorite meal");
      onCancelFavorite();
    } else {
      onDelete?.(mealId);
    }
  };

  if (isFavoriteMode) {
    return (
      <div className="flex justify-between border border-white-700 rounded p-3 items-center text-white">
        <div className="flex items-center gap-4">
          {isEditingName ? (
            NameEditor
          ) : (
            <p
              className="text-2xl cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {mealName}
            </p>
          )}

          <button onClick={handleDeleteOrCancel} className="text-white-500">
            <FaTrashAlt />
          </button>
        </div>

        {(isFirstMeal || isFavoriteMode) && (
          <div className="bg-red-900 flex justify-center items-center text-white rounded overflow-hidden mr-7">
            {["Calories", "Proteins", "Carbs", "Fats"].map((label, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center text-white p-4 w-20 border-white ${
                  idx !== 0 ? "border-l" : ""
                }`}
              >
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs">
                  {label === "Calories" ? "kcal" : "grams"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-between border border-white-700 rounded">
      <div className="flex flex-col text-white p-3">
        <div className="flex gap-4 items-end">
          {isEditingName ? (
            NameEditor
          ) : (
            <p
              className="text-2xl cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {mealName}
            </p>
          )}

          {isEditingTime ? (
            <input
              ref={timeInputRef}
              type="text"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              onBlur={commitTimeChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTimeChange();
                else if (e.key === "Escape") cancelTimeEdit();
              }}
              className="border px-2 py-1 rounded text-black w-20 text-center"
              placeholder="08:00"
              maxLength={5}
            />
          ) : (
            <p
              onClick={() => {
                setIsEditingTime(true);
                setError("");
              }}
              className="cursor-pointer"
            >
              {timeValue + `h`}
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

          <button onClick={handleDeleteOrCancel}>
            <FaTrashAlt className="text-white-500" />
          </button>
        </div>
      </div>

      <div className="flex mr-6">
        {(isFirstMeal || isFavoriteMode) && (
          <div className="bg-red-900 flex justify-center items-center text-white rounded overflow-hidden mr-4">
            {["Calories", "Proteins", "Carbs", "Fats"].map((label, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center text-white p-4 w-20 border-white ${
                  idx !== 0 ? "border-l" : ""
                }`}
              >
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs">
                  {label === "Calories" ? "kcal" : "grams"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
