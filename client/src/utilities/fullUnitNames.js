export const getFullUnitName = (unit) => {
  if (!unit) return "";
  const map = {
    g: "grams",
    ml: "milliliters",
    oz: "ounces",
    lb: "pounds",
    cup: "cup",
    tbsp: "tablespoon",
    tsp: "teaspoon",
  };
  return map[unit.toLowerCase()] || unit;
};