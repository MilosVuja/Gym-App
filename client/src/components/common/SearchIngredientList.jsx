export default function SearchIngredientsList({
  searchText,
  onSearchTextChange,
  suggestions,
  onSelectSuggestion,
  unitMap,
}) {
  return (
    <div>
      <input
        type="text"
        className="w-full border p-2 rounded"
        placeholder="Search for ingredient..."
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
      />

      {searchText.length >= 2 && suggestions.length > 0 && (
        <>
          <h2 className="mt-4 font-semibold">Matching foods:</h2>
          <div className="mt-2 max-h-[400px] overflow-auto border rounded p-2 space-y-2 w-full">
            {suggestions.map((item, idx) => {
              const rawUnit = item.serving_unit?.toLowerCase() || "";
              const fullUnit = unitMap[rawUnit] || rawUnit;

              return (
                <div
                  key={`${item.tag_id || item.food_id}-${idx}`}
                  onClick={() => onSelectSuggestion(item)}
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-3 rounded flex justify-between items-center w-full"
                >
                  <span className="text-sm font-medium w-2/3 truncate">
                    {item.food_name || item.tag_name || "Unnamed"}
                  </span>

                  <div className="text-xs text-gray-500 dark:text-gray-400 w-1/3 text-right">
                    {item.serving_qty
                      ? `${item.serving_qty} ${fullUnit}`
                      : "Add unit"}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
