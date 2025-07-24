export default function MealIngredient() {
  return (
    <div className="border border-white-700 rounded overflow-hidden pl-4">
      <div className="flex justify-between">
        <div className="flex justify-between items-center w-full p-1">
          <div className="flex items-center overflow-hidden flex-grow">
            <p className="truncate whitespace-nowrap overflow-hidden">egg,</p>
            <p className="ml-2 whitespace-nowrap">150g</p>
          </div>
          <div className="flex text-white text-center min-w-[180px]">
            <p className="flex-1 min-w-[50px]">200</p>
            <p className="flex-1 min-w-[50px] ml-8">50</p>
            <p className="flex-1 min-w-[50px] ml-8">0</p>
            <p className="flex-1 min-w-[50px] ml-7 mr-3">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
