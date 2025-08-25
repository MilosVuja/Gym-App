export default function ExerciseCardTraining({
  exercise,
  position,
  showPosition,
  showRemoveButton,
  onRemove,
  draggable = true,
  numberSize = "normal",
  size = "normal",
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
      className={`relative border border-gray-300 p-2.5 m-2.5 rounded-lg cursor-grab select-none shadow-sm  ${
        size === "small" ? "w-[250px] h-[50]" : "w-[320px]"
      }`}
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

      <h3 className="text-lg text-center font-semibold mb-2 pr-6">
        {exercise.name}
      </h3>

      <div
        className={`relative ${
          size === "small" ? "flex justify-center items-center" : ""
        }`}
      >
        <img
          src={exercise.thumbnail || "/default-thumbnail.jpg"}
          alt={exercise.name}
          className={`" object-cover rounded-lg ${
            size === "small"
              ? "w-[200px] h-[125px] flex justify-center items-center"
              : "w-[300px] h-[200px]"
          }`}
        />

        {showPosition && position != null && (
          <div
            className={`absolute  text-white font-bold rounded-full flex items-center justify-center shadow
      ${
        numberSize === "small"
          ? "text-xs bg-blue-900 rounded-full w-5 h-5 flex items-center justify-center  bottom-0 left-0 bg-red-600"
          : "text-sm  w-7 h-7  bottom-2 left-2 bg-blue-600"
      } `}
          >
            {position}
          </div>
        )}
      </div>
    </div>
  );
}
