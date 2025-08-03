import { FaMinusCircle } from "react-icons/fa";
import { getFullUnitName } from "../../utilities/fullUnitNames";

export default function MealIngredients({ ingredient, onDelete, onEdit }) {
  const {
    name = "Unnamed",
    quantity = 1,
    unit = "",
    values = [],
  } = ingredient || {};

  const hasValidQuantity =
    quantity !== undefined &&
    quantity !== null &&
    quantity !== "" &&
    !isNaN(quantity) &&
    Number(quantity) > 0;

  return (
    <div className="relative border border-white-700 overflow-hidden pl-4">
      <div className="flex justify-between items-center w-full p-1">
        <div
          className="flex items-center overflow-hidden flex-grow cursor-pointer"
          onClick={onEdit}
          title={`Edit ${name}`}
        >
          <p className="truncate whitespace-nowrap capitalize overflow-hidden">
            {name}
            {hasValidQuantity && (
              <span className="text-gray-500">
                {`, ${quantity}${unit ? getFullUnitName(unit) : ""}`}
              </span>
            )}
          </p>
        </div>

        <div className="flex text-white text-center min-w-[180px]">
          {values.length > 0 ? (
            values.map((val, idx) => (
              <p key={idx} className="flex-1 min-w-[50px] w-20">
                {typeof val === "number" ? Math.round(val) : val}
              </p>
            ))
          ) : (
            <p className="text-gray-500 italic text-sm">No macros</p>
          )}
        </div>

        <button
          onClick={onDelete}
          className="ml-3 text-red-500 hover:text-red-700"
          title={`Delete ${name}`}
          type="button"
        >
          <FaMinusCircle className="size-4 mr-1.5" />
        </button>
      </div>
    </div>
  );
}
