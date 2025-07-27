import { useState, useEffect } from "react";
import { FaMinusCircle } from "react-icons/fa";
import IngredientEditModal from "./IngredientEditModal";

export default function MealIngredients({ ingredient, onDelete, onEdit }) {
  const {
    name,
    quantity = 1,
    unit = "",
    values = [],
    alt_measures = [],
  } = ingredient;

  const [showEdit, setShowEdit] = useState(false);
  const [modalQty, setModalQty] = useState(quantity);
  const [modalUnitIndex, setModalUnitIndex] = useState(0);

  useEffect(() => {
    if (showEdit) {
      const foundIndex = alt_measures.findIndex((u) => u.measure === unit);
      setModalUnitIndex(foundIndex >= 0 ? foundIndex : 0);
      setModalQty(quantity);
    }
  }, [showEdit, unit, quantity, alt_measures]);

  const handleSave = (updatedIngredient) => {
    onEdit(updatedIngredient);
    setShowEdit(false);
  };

  return (
    <div className="relative border border-white-700 overflow-hidden pl-4">
      <div className="flex justify-between items-center w-full p-1">
        <div
          className="flex items-center overflow-hidden flex-grow cursor-pointer"
          onClick={() => setShowEdit(true)}
        >
          <p className="truncate whitespace-nowrap capitalize overflow-hidden hover:text-blue-500">
            {name}
            {quantity !== undefined && quantity !== null && quantity !== "" && (
              <span className="text-gray-500">
                {`, ${quantity}${unit ? unit : ""}`}
              </span>
            )}
          </p>
        </div>

        <div className="flex text-white text-center min-w-[180px]">
          {values.map((val, idx) => (
            <p key={idx} className="flex-1 min-w-[50px] w-20">
              {typeof val === "number" ? Math.round(val) : val}
            </p>
          ))}
        </div>

        <button
          onClick={onDelete}
          className="ml-3 mr-1.5 text-red-500 hover:text-red-700"
          title="Delete ingredient"
        >
          <FaMinusCircle className="size-4" />
        </button>
      </div>

      {showEdit && (
        <IngredientEditModal
          ingredient={ingredient}
          quantity={modalQty}
          selectedUnitIndex={modalUnitIndex}
          units={alt_measures}
          onQtyChange={setModalQty}
          onUnitChange={setModalUnitIndex}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
