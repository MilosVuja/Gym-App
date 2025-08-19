export default function ExerciseCard({
  exercise,
  index,
  draggable = false,
  onDragStart,
  onRemove,
  showRemoveButton = false,
  showPosition = false,
  className = "",
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition duration-200 ${className}`}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, exercise._id)}
    >
      <img
        src={exercise.thumbnail || "/placeholder.jpg"}
        alt={exercise.name || "Exercise"}
        className="w-24 h-24 object-cover rounded-lg border"
      />
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="text-lg font-semibold">
            {showPosition ? `${index + 1}. ` : ""}
            {exercise.name}
          </h4>

          {showRemoveButton && onRemove && (
            <button
              onClick={() => onRemove(exercise._id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mt-1 space-y-1 text-sm text-gray-700">
          {exercise.sets && <p>Sets: {exercise.sets}</p>}
          {exercise.reps && <p>Reps: {exercise.reps}</p>}
          {exercise.weight && <p>Weight: {exercise.weight} kg</p>}
          {exercise.rest && <p>Rest: {exercise.rest} sec</p>}
        </div>
      </div>
    </div>
  );
}
