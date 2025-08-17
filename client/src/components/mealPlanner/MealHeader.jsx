import { useRef, useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useSelector } from "react-redux";

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
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeValue, setTimeValue] = useState(initialTime.replace("h", ""));
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [copyFromDateOpen, setCopyFromDateOpen] = useState(false);
  const [copyToDateOpen, setCopyToDateOpen] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);

  const menuRef = useRef();
  const quickAddRef = useRef();
  const copyFromDateRef = useRef();
  const copyToDateRef = useRef();
  const timeInputRef = useRef();

  const assignedPlanByDay = useSelector(
    (state) => state.nutrition.assignedPlanByDay
  );
  const weekDays = useSelector((state) => state.nutrition.weekDays);

  useEffect(() => setMealName(initialName || ""), [initialName]);

  useEffect(() => {
    if (isEditingTime && timeInputRef.current) {
      timeInputRef.current.focus();
      timeInputRef.current.setSelectionRange(
        timeValue.length,
        timeValue.length
      );
    }
  }, [isEditingTime, timeValue.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (menuRef.current && menuRef.current.contains(e.target)) ||
        (quickAddRef.current && quickAddRef.current.contains(e.target)) ||
        (copyFromDateRef.current &&
          copyFromDateRef.current.contains(e.target)) ||
        (copyToDateRef.current && copyToDateRef.current.contains(e.target))
      ) {
        return;
      }
      setMenuOpen(false);
      setQuickAddOpen(false);
      setCopyFromDateOpen(false);
      setCopyToDateOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitNameEdit = () => {
    setIsEditingName(false);
    onNameChange?.(mealId, mealName.trim());
  };

  const cancelNameEdit = () => {
    setMealName(initialName || "");
    setIsEditingName(false);
  };

  const commitTimeChange = () => {
    const trimmed = timeValue.trim();
    const isValid = /^([01]?\d|2[0-3]):([0-5]\d)$/.test(trimmed);
    if (isValid) {
      onTimeChange?.(mealId, `${trimmed}h`);
      setError("");
      setIsEditingTime(false);
    } else setError("Invalid time format (HH:MM)");
  };

  const cancelTimeEdit = () => {
    setTimeValue(initialTime.replace("h", ""));
    setError("");
    setIsEditingTime(false);
  };

  const handleDeleteOrCancel = () => {
    if (isFavoriteMode && onCancelFavorite) onCancelFavorite();
    else onDelete?.(mealId);
  };

  const handleQuickAddClick = () => {
    setQuickAddOpen((prev) => !prev);
    setCopyFromDateOpen(false);
    setCopyToDateOpen(false);
    setMenuOpen(true);
  };

  const handleCopyFromDateClick = () => {
    if (!assignedPlanByDay || !weekDays) return;
    setCopyFromDateOpen((prev) => !prev);
    setQuickAddOpen(false);
    setCopyToDateOpen(false);
    setMenuOpen(true);

    const savedDates = Object.keys(assignedPlanByDay)
      .map((dayIndex) => {
        const idx = parseInt(dayIndex);
        const dateObj = weekDays[idx]?.date;
        return dateObj ? new Date(dateObj) : null;
      })
      .filter(Boolean)
      .sort((a, b) => b - a);

    setAvailableDates(savedDates.slice(0, 7));
  };

  const copyMealFromDate = (dateObj) => {
    const dayIndex = weekDays.findIndex(
      (d) => new Date(d.date).toDateString() === dateObj.toDateString()
    );
    if (dayIndex === -1) return;

    const macrosToCopy = assignedPlanByDay[dayIndex]?.[mealId];
    if (!macrosToCopy) return;

    onAddMeal(macrosToCopy);
    setCopyFromDateOpen(false);
    setMenuOpen(false);
  };

  const handleCopyToDateClick = () => {
    setCopyToDateOpen((prev) => !prev);
    setQuickAddOpen(false);
    setCopyFromDateOpen(false);
    setMenuOpen(true);
  };

  const copyMealToDate = (dateObj) => {
    console.log("Copying meal", mealId, "to", dateObj);
    setCopyToDateOpen(false);
    setMenuOpen(false);
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

  const today = new Date();
  const copyToDates = [];
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    copyToDates.push(date);
  }

  const buildCopyFromDateList = (availableDates) =>
    [...availableDates].sort((a, b) => b - a);

  const formatCopyFromDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  const buildCopyToDateList = (copyToDates, today) => {
    const tomorrow = new Date(today.getTime() + 86400000);
    const yesterday = new Date(today.getTime() - 86400000);

    const futureDates = copyToDates
      .filter((d) => d > today && d.toDateString() !== tomorrow.toDateString())
      .sort((a, b) => b - a);

    const pastDates = copyToDates
      .filter((d) => d < today && d.toDateString() !== yesterday.toDateString())
      .sort((a, b) => b - a);

    return [...futureDates, tomorrow, yesterday, ...pastDates];
  };

  const formatCopyDate = (date, today) => {
    const tomorrow = new Date(today.getTime() + 86400000);
    const yesterday = new Date(today.getTime() - 86400000);

    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

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
              {timeValue}h
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
              className="absolute right-0 top-10 bg-white shadow-lg rounded z-50 w-52"
            >
              <ul className="text-sm text-gray-700">
                <li
                  className="hover:bg-gray-100 px-4 py-2 cursor-pointer"
                  onClick={handleQuickAddClick}
                >
                  Quick Add Calories
                </li>
                <li
                  className="hover:bg-gray-100 px-4 py-2 cursor-pointer"
                  onClick={handleCopyFromDateClick}
                >
                  Copy from Date
                </li>
                <li className="hover:bg-gray-100 px-4 py-2 cursor-pointer">
                  Copy from Yesterday
                </li>
                <li
                  className="hover:bg-gray-100 px-4 py-2 cursor-pointer"
                  onClick={handleCopyToDateClick}
                >
                  Copy to Date
                </li>
              </ul>

              {quickAddOpen && (
                <div
                  ref={quickAddRef}
                  className="absolute left-full top-0 bg-white text-black shadow-lg rounded p-4 w-72 z-50"
                >
                  <h3 className="font-semibold mb-2 text-gray-800">
                    Quick Add Macros
                  </h3>
                  <div className="flex flex-col gap-2">
                    <label>
                      Select Meal:
                      <select className="border rounded px-2 py-1 w-full">
                        <option>Meal 1</option>
                        <option>Meal 2</option>
                      </select>
                    </label>
                    <label>
                      Calories:
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                      />
                    </label>
                    <label>
                      Proteins:
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                      />
                    </label>
                    <label>
                      Carbs:
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                      />
                    </label>
                    <label>
                      Fats:
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-full"
                      />
                    </label>
                    <button className="bg-blue-500 text-white px-4 py-1 rounded mt-2">
                      Add
                    </button>
                  </div>
                </div>
              )}

              {copyFromDateOpen && (
                <div
                  ref={copyFromDateRef}
                  className="absolute left-full top-0 bg-white shadow-lg rounded z-50 w-52 text-black"
                >
                  <h3 className="font-semibold p-2 border-b">
                    Copy {mealName} to:
                  </h3>
                  <ul>
                    {buildCopyFromDateList(availableDates).map((date) => (
                      <li
                        key={date.toISOString()}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => copyMealFromDate(date)}
                      >
                        {formatCopyFromDate(date)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {copyToDateOpen && (
                <div
                  ref={copyToDateRef}
                  className="absolute left-full top-0 bg-white shadow-lg rounded z-50 w-64 text-black"
                >
                  <h3 className="font-semibold p-2 border-b">
                    Copy {mealName} to:
                  </h3>
                  <ul>
                    {buildCopyToDateList(copyToDates, today).map((date) => (
                      <li
                        key={date.toISOString()}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => copyMealToDate(date)}
                      >
                        {formatCopyDate(date, today)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
