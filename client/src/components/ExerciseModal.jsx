import { useState } from "react";
import { FaTrash, FaRegCopy, FaTrashAlt } from "react-icons/fa";

export default function ExerciseModal({
  exerciseName,
  videoSrc,
  initialInstructions,
  onClose,
  onSave,
}) {
  const [rows, setRows] = useState([
    { id: Date.now(), reps: 0, weight: 0, rest: 0, dropSets: [] },
  ]);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const updateField = (
    rowId,
    field,
    value,
    isDelta = false,
    dropSetIndex = null
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (dropSetIndex === null) {
          const newValue = isDelta
            ? Math.max(0, (row[field] || 0) + value)
            : Math.max(0, value);
          return { ...row, [field]: newValue };
        } else {
          const updatedDropSets = row.dropSets.map((ds, i) => {
            if (i !== dropSetIndex) return ds;
            const newValue = isDelta
              ? Math.max(0, (ds[field] || 0) + value)
              : Math.max(0, value);
            return { ...ds, [field]: newValue };
          });
          return { ...row, dropSets: updatedDropSets };
        }
      })
    );
  };

  const handleInputChange = (rowId, field, e, dropSetIndex = null) => {
    const value = Number(e.target.value);
    updateField(rowId, field, value, false, dropSetIndex);
  };

  const addDropSet = (rowId) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          dropSets: [...row.dropSets, { reps: 0, weight: 0 }],
        };
      })
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), reps: 0, weight: 0, rest: 0, dropSets: [] },
    ]);
  };

  const copyRow = (rowId) => {
    const index = rows.findIndex((row) => row.id === rowId);
    if (index === -1) return;
    const copiedRow = { ...rows[index], id: crypto.randomUUID() };
    copiedRow.dropSets = copiedRow.dropSets.map((ds) => ({ ...ds }));
    const updatedRows = [...rows];
    updatedRows.splice(index + 1, 0, copiedRow);
    setRows(updatedRows);
  };

  const deleteRow = (rowId) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== rowId) : prev
    );
  };

  const handleSave = () => {
    if (onSave) onSave({ rows, instructions });
  };

  const handleDragStart = (e, rowId) => {
    setDraggedId(rowId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, rowId) => {
    e.preventDefault();
    setDragOverId(rowId);
  };

  const handleDrop = (e, rowId) => {
    e.preventDefault();
    if (draggedId === null || draggedId === rowId) return;

    const draggedIndex = rows.findIndex((r) => r.id === draggedId);
    const dropIndex = rows.findIndex((r) => r.id === rowId);

    const updatedRows = [...rows];
    const [draggedRow] = updatedRows.splice(draggedIndex, 1);
    updatedRows.splice(dropIndex, 0, draggedRow);

    setRows(updatedRows);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const removeDropSet = (rowId, dropIndex) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this dropset?"
    );
    if (!confirmDelete) return;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const newDropSets = [...row.dropSets];
        newDropSets.splice(dropIndex, 1);
        return { ...row, dropSets: newDropSets };
      })
    );
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

        <div className="wrapper_adjust flex flex-col gap-4">
          <div className="rows-container flex flex-col">
            <div className="exercise-row flex flex-col border border-red-900 p-4 first:rounded-t-md">
              <div className="header-row grid grid-cols-6 place-items-center">
                <span className="font-bold">SETS</span>
                <span className="font-bold">REPS</span>
                <span className="font-bold">WEIGHT</span>
                <span className="font-bold">REST</span>
                <span className="font-bold"></span>
                <button
                  type="button"
                  className="add-row cursor-pointer bg-transparent border-none text-base text-center h-12 w-28 hover:bg-red-900 hover:rounded-full hover:text-black hover:font-extrabold"
                  onClick={addRow}
                >
                  Add Row
                </button>
              </div>
            </div>

            {rows.map((row, index) => (
              <div
                key={row.id}
                className={`exercise-row flex flex-col border border-red-900 p-4 first:rounded-t-md transition-colors duration-200 ${
                  dragOverId === row.id ? "bg-red-900/10" : ""
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, row.id)}
                onDragOver={(e) => handleDragOver(e, row.id)}
                onDrop={(e) => handleDrop(e, row.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="input-row grid grid-cols-6 place-items-center gap-x-2">
                  <div className="font-bold text-lg select-none">
                    {index + 1}
                  </div>

                  <div className="flex flex-col items-center justify-center space-y-2">
                    {[
                      { isDrop: false, val: row.reps },
                      ...row.dropSets.map((ds) => ({
                        isDrop: true,
                        val: ds.reps,
                      })),
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="counter flex pl-12 items-center justify-center relative whitespace-nowrap"
                      >
                        <input
                          type="number"
                          className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                          min={0}
                          step={1}
                          value={item.val}
                          onChange={(e) =>
                            handleInputChange(
                              row.id,
                              "reps",
                              e,
                              item.isDrop ? i - 1 : null
                            )
                          }
                        />
                        {[1, -1].map((delta) => (
                          <button
                            key={delta}
                            type="button"
                            className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                            onClick={() =>
                              updateField(
                                row.id,
                                "reps",
                                delta,
                                true,
                                item.isDrop ? i - 1 : null
                              )
                            }
                          >
                            {delta > 0 ? "+" : "-"}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    {[
                      { isDrop: false, val: row.weight },
                      ...row.dropSets.map((ds) => ({
                        isDrop: true,
                        val: ds.weight,
                      })),
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center gap-2 min-h-[40px]"
                      >
                        <div className="counter flex items-center justify-center whitespace-nowrap">
                          <input
                            type="number"
                            className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                            min={0}
                            step={2.5}
                            value={item.val}
                            onChange={(e) =>
                              handleInputChange(
                                row.id,
                                "weight",
                                e,
                                item.isDrop ? i - 1 : null
                              )
                            }
                          />
                          {[1, -1].map((delta) => (
                            <button
                              key={delta}
                              type="button"
                              className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                              onClick={() =>
                                updateField(
                                  row.id,
                                  "weight",
                                  delta * 2.5,
                                  true,
                                  item.isDrop ? i - 1 : null
                                )
                              }
                            >
                              {delta > 0 ? "+" : "-"}
                            </button>
                          ))}
                        </div>
                        {item.isDrop && (
                          <button
                            type="button"
                            className="text-red-900 hover:text-white text-base p-1"
                            title="Remove this dropset"
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to remove this dropset?"
                                )
                              ) {
                                removeDropSet(row.id, i - 1);
                              }
                            }}
                          >
                            <FaTrashAlt />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    className={`flex flex-col items-center ${
                      row.dropSets.length > 0 ? "mt-auto" : "justify-center"
                    }`}
                  >
                    <div className="counter flex pl-12 items-center justify-center relative whitespace-nowrap">
                      <input
                        type="number"
                        className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                        min={0}
                        step={60}
                        value={row.rest}
                        onChange={(e) => handleInputChange(row.id, "rest", e)}
                      />
                      {[60, -60].map((val) => (
                        <button
                          key={val}
                          type="button"
                          className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                          onClick={() => updateField(row.id, "rest", val, true)}
                        >
                          {val > 0 ? "+" : "-"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <button
                      type="button"
                      className="border-2 border-red-600 bg-black rounded-full text-xs font-bold py-1 px-3 mt-2 text-white cursor-pointer hover:text-black hover:bg-red-600"
                      onClick={() => addDropSet(row.id)}
                    >
                      Add Dropset
                    </button>
                  </div>

                  <div className="flex flex-row gap-4 justify-center mt-4">
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
            ))}
          </div>

          <div className="flex justify-end">
            <button
              className="save border-2 border-red-600 bg-transparent rounded-full text-xs font-bold py-2 px-5 mt-4 text-white cursor-pointer hover:text-black hover:bg-red-600"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
