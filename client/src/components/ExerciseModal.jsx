import { useState } from "react";
import { FaTrash, FaRegCopy } from "react-icons/fa";

export default function ExerciseModal({
  exerciseName = "Name of the exercise",
  videoSrc = "",
  initialInstructions = "",
  onClose,
  onSave,
  show = false,
}) {
  const [rows, setRows] = useState([
    { id: Date.now(), sets: 0, reps: 0, weight: 0, rest: 0 },
  ]);
  const [instructions, setInstructions] = useState(initialInstructions);

  if (!show) return null;

  const updateField = (rowId, field, deltaOrValue, isDelta = true) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        let newValue = isDelta
          ? Math.max(0, (row[field] || 0) + deltaOrValue)
          : Math.max(0, deltaOrValue);
        return { ...row, [field]: newValue };
      })
    );
  };

  const handleInputChange = (rowId, field, e) => {
    const value = Number(e.target.value);
    updateField(rowId, field, value, false);
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: Date.now(), sets: 0, reps: 0, weight: 0, rest: 0 },
    ]);
  };

  const copyRow = (rowId) => {
    const index = rows.findIndex((row) => row.id === rowId);
    if (index === -1) return;

    const copiedRow = { ...rows[index], id: crypto.randomUUID() };
    const updatedRows = [...rows];
    updatedRows.splice(index + 1, 0, copiedRow);
    setRows(updatedRows);
  };

  const deleteRow = (rowId) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.id !== rowId);
    });
  };

  const handleSave = () => {
    if (onSave) onSave({ rows, instructions });
  };

  return (
    <div
      className="modal-exercise-back fixed inset-0 z-[1000] p-28 bg-gray-300/50 overflow-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-exercise bg-black p-4 md:p-8 border-2 border-red-600 rounded-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="text-center text-red-600 text-2xl">{exerciseName}</h3>
          <div className="video-instruction my-4 flex flex-wrap justify-between">
            <div className="video">
              {videoSrc ? (
                <iframe
                  className="w-full h-80"
                  src={videoSrc}
                  frameBorder="0"
                  allowFullScreen
                  title="Exercise Video"
                />
              ) : (
                <div className="h-48 w-80 bg-gray-700 flex items-center justify-center text-gray-300">
                  No video available
                </div>
              )}
            </div>
            <div className="instruction">
              <form>
                <textarea
                  className="text-white border-2 border-red-900 rounded-md w-[30vw] h-48 p-2 text-base placeholder-black outline-none"
                  placeholder="Input instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </form>
            </div>
          </div>
        </div>

        <div className="wrapper_adjust">
          <div className="rows-container flex flex-col">
            <div className="exercise-row flex flex-col border border-red-900 p-4 first:rounded-t-md">
              <div className="header-row grid grid-cols-5 place-items-center">
                <span className="font-bold">SETS</span>
                <span className="font-bold">REPS</span>
                <span className="font-bold">WEIGHT</span>
                <span className="font-bold">REST</span>
                <button
                  type="button"
                  className="add-row cursor-pointer bg-transparent border-none text-base text-center h-12 w-28 hover:bg-red-900 hover:rounded-full hover:text-black hover:font-extrabold"
                  onClick={addRow}
                >
                  Add Row
                </button>
              </div>
            </div>

            {rows.map((row) => (
              <div
                key={row.id}
                className="exercise-row flex flex-col border border-red-900 p-4 first:rounded-t-md"
              >
                <div className="input-row grid grid-cols-5 place-items-center">
                  {["sets", "reps", "weight", "rest"].map((field) => (
                    <div
                      key={field}
                      className="exercise-field flex flex-col items-center justify-center"
                    >
                      <div className="counter flex pl-12 items-center justify-center relative">
                        <input
                          type="number"
                          className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                          min={0}
                          step={
                            field === "weight" ? 2.5 : field === "rest" ? 60 : 1
                          }
                          value={row[field]}
                          onChange={(e) => handleInputChange(row.id, field, e)}
                        />
                        <button
                          type="button"
                          className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                          onClick={() =>
                            updateField(
                              row.id,
                              field,
                              field === "weight"
                                ? 2.5
                                : field === "rest"
                                ? 60
                                : 1,
                              true
                            )
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                          onClick={() =>
                            updateField(
                              row.id,
                              field,
                              field === "weight"
                                ? -2.5
                                : field === "rest"
                                ? -60
                                : -1,
                              true
                            )
                          }
                        >
                          -
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="exercise-field flex flex-col items-center justify-center">
                    <div className="row-actions flex flex-row gap-4 justify-center">
                      <button
                        onClick={() => copyRow(row.id)}
                        className="text-red-900 hover:text-red-600 text-lg cursor-pointer"
                        aria-label="Copy row"
                      >
                        <FaRegCopy />
                      </button>
                      <button
                        onClick={() => deleteRow(row.id)}
                        className="text-red-900 hover:text-red-600 text-lg cursor-pointer"
                        aria-label="Delete row"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="save border-2 border-red-600 bg-transparent rounded-full text-xs font-bold py-2 px-5 mt-4 text-white cursor-pointer hover:text-black hover:bg-red-600"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
