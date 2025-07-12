import { useState } from "react";
import { FaTrash, FaTrashAlt, FaRegCopy } from "react-icons/fa";

export default function ExerciseModal({

  exerciseName,
  videoSrc,
  initialInstructions,
  initialRows,
  onClose,
  onSave,
}) {
  const [rows, setRows] = useState(
    initialRows || [
      { id: Date.now(), reps: 0, weight: 0, rest: 0, dropsets: [] },
    ]
  );
  const [instructions, setInstructions] = useState(initialInstructions || "");

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

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

  const updateDropset = (rowId, dsIndex, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const newDropsets = [...(row.dropsets || [])];
        newDropsets[dsIndex] = {
          ...newDropsets[dsIndex],
          [field]: Math.max(0, value),
        };
        return { ...row, dropsets: newDropsets };
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
      { id: crypto.randomUUID(), reps: 0, weight: 0, rest: 0, dropsets: [] },
    ]);
  };

  const copyRow = (rowId) => {
    const index = rows.findIndex((row) => row.id === rowId);
    if (index === -1) return;
    const copiedRow = { ...rows[index], id: crypto.randomUUID() };
    if (copiedRow.dropsets) {
      copiedRow.dropsets = copiedRow.dropsets.map((ds) => ({ ...ds }));
    }
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

  const addDropset = (rowId) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const dropsets = row.dropsets ? [...row.dropsets] : [];
        dropsets.push({ reps: 0, weight: 0 });
        return { ...row, dropsets };
      })
    );
  };

  const removeDropset = (rowId, dsIndex) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const dropsets = [...(row.dropsets || [])];
        dropsets.splice(dsIndex, 1);
        return { ...row, dropsets };
      })
    );
  };

const handleSave = () => {
  if (onSave) {
    onSave({ rows, instructions });
    setTimeout(() => {
      if (onClose) onClose();
    }, 0);
  }
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
    if (draggedId === null) return;
    if (draggedId === rowId) return;

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

  return (
    <div
      className="modal-exercise-back fixed inset-0 z-[1000] p-28 bg-gray-300/50 overflow-auto"
      onClick={() => {
        if (onSave) onSave({ rows, instructions });
        if (onClose) onClose();
      }}
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

        <div className="wrapper_adjust flex flex-col">
          <div className="rows-container flex flex-col">
            <div className="exercise-row flex flex-col border border-red-900 p-4 first:rounded-t-md">
              <div className="header-row grid grid-cols-7 place-items-center gap-x-2">
                <span className="font-bold">SETS</span>
                <span className="font-bold">REPS</span>
                <span className="font-bold">WEIGHT</span>
                <span></span>
                <span className="font-bold">REST</span>
                <span></span>
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
                className={`exercise-row flex flex-col border border-red-900 p-4 first:rounded-t-md
                  ${dragOverId === row.id ? "bg-red-900/50" : ""}
                  ${draggedId === row.id ? "opacity-50" : "opacity-100"}
                  ${draggedId === row.id ? "cursor-grabbing" : "cursor-grab"}
                `}
                draggable
                onDragStart={(e) => handleDragStart(e, row.id)}
                onDragOver={(e) => handleDragOver(e, row.id)}
                onDrop={(e) => handleDrop(e, row.id)}
                onDragEnd={handleDragEnd}
              >
                <div className="input-row grid grid-cols-7 items-stretch gap-x-2">
                  <div className="exercise-field h-full flex items-center justify-center font-bold text-lg select-none">
                    {index + 1}
                  </div>

                  <div className="exercise-field flex flex-col items-center justify-start">
                    <div className="counter flex pl-12 items-center justify-center relative">
                      <input
                        type="number"
                        className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                        min={0}
                        step={1}
                        value={row.reps}
                        onChange={(e) => handleInputChange(row.id, "reps", e)}
                      />
                      <button
                        type="button"
                        className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                        onClick={() => updateField(row.id, "reps", 1, true)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                        onClick={() => updateField(row.id, "reps", -1, true)}
                      >
                        -
                      </button>
                    </div>
                    {row.dropsets?.map((ds, i) => (
                      <div
                        key={`reps-ds-${i}`}
                        className="counter flex pl-12 items-center justify-center relative mt-1"
                      >
                        <input
                          type="number"
                          className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                          min={0}
                          step={1}
                          value={ds.reps}
                          onChange={(e) =>
                            updateDropset(
                              row.id,
                              i,
                              "reps",
                              Number(e.target.value)
                            )
                          }
                        />
                        <button
                          type="button"
                          className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                          onClick={() =>
                            updateDropset(row.id, i, "reps", ds.reps + 1)
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                          onClick={() =>
                            updateDropset(
                              row.id,
                              i,
                              "reps",
                              Math.max(0, ds.reps - 1)
                            )
                          }
                        >
                          -
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="exercise-field flex flex-col items-center justify-start">
                    <div className="counter flex pl-12 items-center justify-center relative">
                      <input
                        type="number"
                        className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                        min={0}
                        step={2.5}
                        value={row.weight}
                        onChange={(e) => handleInputChange(row.id, "weight", e)}
                      />
                      <button
                        type="button"
                        className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                        onClick={() => updateField(row.id, "weight", 2.5, true)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                        onClick={() =>
                          updateField(row.id, "weight", -2.5, true)
                        }
                      >
                        -
                      </button>
                    </div>
                    {row.dropsets?.map((ds, i) => (
                      <div
                        key={`weight-ds-${i}`}
                        className="counter flex pl-12 items-center justify-center relative mt-1"
                      >
                        <input
                          type="number"
                          className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                          min={0}
                          step={2.5}
                          value={ds.weight}
                          onChange={(e) =>
                            updateDropset(
                              row.id,
                              i,
                              "weight",
                              Number(e.target.value)
                            )
                          }
                        />
                        <button
                          type="button"
                          className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                          onClick={() =>
                            updateDropset(row.id, i, "weight", ds.weight + 2.5)
                          }
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                          onClick={() =>
                            updateDropset(
                              row.id,
                              i,
                              "weight",
                              Math.max(0, ds.weight - 2.5)
                            )
                          }
                        >
                          -
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="exercise-field flex flex-col items-center justify-end gap-1">
                    {row.dropsets && row.dropsets.length > 0
                      ? row.dropsets.map((_, i) => (
                          <button
                            key={`remove-ds-${i}`}
                            type="button"
                            className="text-red-600 hover:text-red-400 text-lg font-bold p-1 flex items-center justify-center w-16 h-8"
                            onClick={() => removeDropset(row.id, i)}
                            aria-label="Remove dropset"
                            title="Remove dropset"
                          >
                            <FaTrashAlt />
                          </button>
                        ))
                      : null}
                  </div>
                  <div className="exercise-field h-full flex items-end justify-center">
                    <div className="counter flex pl-12 items-center justify-center relative">
                      <input
                        type="number"
                        className="no-spinner w-16 text-center bg-transparent border-none text-base font-bold m-0 outline-none"
                        min={0}
                        step={60}
                        value={row.rest}
                        onChange={(e) => handleInputChange(row.id, "rest", e)}
                      />
                      <button
                        type="button"
                        className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                        onClick={() => updateField(row.id, "rest", 60, true)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="text-2xl bg-transparent border-none p-0.5 cursor-pointer text-red-900 hover:text-red-600"
                        onClick={() => updateField(row.id, "rest", -60, true)}
                      >
                        -
                      </button>
                    </div>
                  </div>
                  <div className="exercise-field h-full flex items-center justify-center">
                    <button
                      type="button"
                      className="text-xs border border-red-600 px-2 py-1 rounded hover:bg-red-600 hover:text-black text-white"
                      onClick={() => addDropset(row.id)}
                    >
                      Add Dropset
                    </button>
                  </div>
                  <div className="exercise-field h-full flex items-center justify-center">
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
