export default function MealIngredient({ ingredient }) {
  const { name, grams, values } = ingredient;

  return (
    <div className="border border-white-700 rounded overflow-hidden pl-4">
      <div className="flex justify-between">
        <div className="flex justify-between items-center w-full p-1">
          <div className="flex items-center overflow-hidden flex-grow">
            <p className="truncate whitespace-nowrap overflow-hidden">
              {name},
            </p>
            <p className="ml-2 whitespace-nowrap">{grams}</p>
          </div>
          <div className="flex text-white text-center min-w-[180px]">
            {values.map((val, idx) => (
              <p
                key={idx}
                className={`flex-1 min-w-[50px] ${
                  idx === 1 || idx === 2 ? "ml-8" : idx === 3 ? "ml-7 mr-3" : ""
                }`}
              >
                {val}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
