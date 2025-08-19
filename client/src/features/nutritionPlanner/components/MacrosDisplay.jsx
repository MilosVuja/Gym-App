import { useSelector } from "react-redux";

export default function MacrosDisplay() {
  const { recommended, customInputs, customMacros, final } = useSelector((state) => state.nutrition);

  return (
    <div className="space-y-4">
      <div>
        <h3>Recommended Macros</h3>
        <p>Calories: {recommended.calories}kcal</p>
        <p>Protein: {recommended.protein}grams</p>
        <p>Carbs: {recommended.carbs}grams</p>
        <p>Fat: {recommended.fat}grams</p>
      </div>

      {customInputs.proteinPerKg !== null && (
        <div>
          <h3>Customized Macros</h3>
          <p>Protein: {customInputs.proteinPerKg}g/kg</p>
          <p>Fat: {customInputs.fatPerKg}g/kg</p>
          <p>Calories: {customMacros.calories}kcal</p>
          <p>Protein: {customMacros.protein}grams</p>
          <p>Carbs: {customMacros.carbs}grams</p>
          <p>Fat: {customMacros.fat}grams</p>
        </div>
      )}

      <div>
        <h3>Final Macros ({final.base})</h3>
        <p>Calories: {final.adjustedMacros.calories}kcal</p>
        <p>Protein: {final.adjustedMacros.protein}grams</p>
        <p>Carbs: {final.adjustedMacros.carbs}grams</p>
        <p>Fat: {final.adjustedMacros.fat}grams</p>
      </div>
    </div>
  );
}
