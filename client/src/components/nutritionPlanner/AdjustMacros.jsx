import { useDispatch, useSelector } from "react-redux";
import { updateAdjustedMacros } from "../../redux/nutritionSlice";

export default function AdjustMacros() {
  const dispatch = useDispatch();
  const adjustments = useSelector((state) => state.nutrition.final.adjustments);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateAdjustedMacros({ [name]: parseInt(value) || 0 }));
  };

  return (
    <div className="space-y-2">
      <h3>Adjust Final Macros</h3>
      <input
        type="number"
        name="calories"
        placeholder="Calories Adjustment"
        value={adjustments.calories}
        onChange={handleChange}
      />
      <input
        type="number"
        name="protein"
        placeholder="Protein Adjustment"
        value={adjustments.protein}
        onChange={handleChange}
      />
      <input
        type="number"
        name="carbs"
        placeholder="Carbs Adjustment"
        value={adjustments.carbs}
        onChange={handleChange}
      />
      <input
        type="number"
        name="fat"
        placeholder="Fat Adjustment"
        value={adjustments.fat}
        onChange={handleChange}
      />
    </div>
  );
}
