export default function ExerciseCard({ exercise }) {
  return (
    <div className="flex items-start gap-4 p-3 border rounded hover:shadow transition">
      <img
        src={exercise.thumbnail}
        alt={exercise.name}
        className="w-24 h-24 object-cover rounded"
      />
      <div>
        <h4 className="text-lg font-bold">{exercise.name}</h4>
        <p className="text-sm text-gray-600">Sets: {exercise.sets}</p>
        <p className="text-sm text-gray-600">Reps: {exercise.reps}</p>
        <p className="text-sm text-gray-600">Weight: {exercise.weight} kg</p>
        <p className="text-sm text-gray-600">Rest: {exercise.rest} sec</p>
      </div>
    </div>
  );
}
