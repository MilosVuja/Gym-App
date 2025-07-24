import { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

export default function MealHeader({ mealName: initialName, mealTime }) {
  const [mealName, setMealName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const handleEditClick = () => setIsEditing(true);
  const handleBlur = () => setIsEditing(false);
  const handleChange = (e) => setMealName(e.target.value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center border border-white-700 rounded">
      <div className="flex flex-col text-white p-4">
        <div className="flex gap-4 items-center">
          {isEditing ? (
            <input
              type="text"
              value={mealName}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              className="border px-2 py-1 rounded text-black"
            />
          ) : (
            <p className="text-2xl">{mealName}</p>
          )}
          <button onClick={handleEditClick}>
            <FaEdit className="text-white-500" />
          </button>
          <p>{mealTime}</p>
        </div>
        <div className="relative flex gap-4 items-center">
          <button className="border border-white text-white py-1 px-3 rounded text-xs">
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
          <button>
            <FaTrashAlt className="text-white-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
