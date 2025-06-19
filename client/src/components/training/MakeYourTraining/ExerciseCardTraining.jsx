export default function ExerciseCardTraining({
  exercise,
  position,
  showPosition,
  showRemoveButton,
  onRemove,
  draggable = true,
  onDragStart,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={
        onDragStart ||
        ((e) =>
          e.dataTransfer.setData("application/json", JSON.stringify(exercise)))
      }
      className="relative border border-gray-300 p-2.5 m-2.5 rounded-lg w-[320px] cursor-grab select-none shadow-sm"
    >
      {showRemoveButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove && onRemove(exercise._id);
          }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 flex items-center justify-center text-sm font-bold shadow-sm"
          aria-label="Remove exercise"
        >
          &times;
        </button>
      )}

      <h3 className="text-lg text-center font-semibold mb-2 pr-6">{exercise.name}</h3>

      <div className="relative">
        <img
          src={exercise.thumbnail || "/default-thumbnail.jpg"}
          alt={exercise.name}
          className="w-[300px] h-[200px] object-cover rounded-lg"
        />

        {showPosition && position != null && (
          <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
            {position}
          </div>
        )}
      </div>
    </div>
  );
}
