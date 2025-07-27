import { FaMinusCircle } from "react-icons/fa";

export default function MealIngredients({ ingredient, onDelete }) {
  const { name, grams, values } = ingredient;

  return (
    <div className="border border-white-700 overflow-hidden pl-4">
      <div className="flex justify-between items-center w-full p-1">
        <div className="flex items-center overflow-hidden flex-grow">
          <p className="truncate whitespace-nowrap overflow-hidden">
            {name},
          </p>
          <p className="ml-2 whitespace-nowrap">{grams}</p>
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
          className="ml-4 text-red-500 hover:text-red-700"
          title="Delete ingredient"
        >
          <FaMinusCircle className="size-4" />
        </button>
      </div>
    </div>
  );
}
