import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "../../redux/nutritionSlice";

export default function InfoInputs() {
  const dispatch = useDispatch();
  const info = useSelector((state) => state.nutrition.info);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateUserInfo({ [name]: value }));
  };

  return (
    <div className="space-y-2">
      <input
        type="number"
        name="weight"
        placeholder="Weight (kg)"
        value={info.weight}
        onChange={handleChange}
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        value={info.age}
        onChange={handleChange}
      />
      <select name="activityLevel" value={info.activityLevel} onChange={handleChange}>
        <option value="">Select Activity</option>
        <option value="light">Light</option>
        <option value="moderate">Moderate</option>
        <option value="active">Active</option>
      </select>
      <select name="goal" value={info.goal} onChange={handleChange}>
        <option value="">Select Goal</option>
        <option value="lose">Lose Fat</option>
        <option value="maintain">Maintain</option>
        <option value="gain">Gain Muscle</option>
      </select>
    </div>
  );
}
