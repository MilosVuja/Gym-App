import { useState, useRef, useEffect } from "react";
import { LuNotebookText } from "react-icons/lu";

export default function MealFooter() {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const noteRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (noteRef.current && !noteRef.current.contains(e.target)) {
        setShowNote(false);
      }
    };
    if (showNote) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNote]);

  return (
    <div className="flex justify-between border border-white-700 rounded pl-2">
      <div className="text-white">
        <div className="relative">
          <div className="flex text-white gap-78 items-center p-2 justify-between">
            <button onClick={() => setShowNote((prev) => !prev)}>
              <LuNotebookText className="text-white-500 text-xl" />
            </button>
            <p className="">Meal total:</p>
          </div>
          {showNote && (
            <div
              ref={noteRef}
              className="absolute left-0 mt-2 w-64 z-50 bg-gray-800 text-white border border-gray-600 rounded shadow-lg"
            >
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Leave a note..."
                className="w-full p-2 bg-transparent text-sm resize-none focus:outline-none"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center text-white text-center min-w-[180px] pr-1">
        <p className="flex-1 min-w-[50px]">200</p>
        <p className="flex-1 min-w-[50px] ml-8">50</p>
        <p className="flex-1 min-w-[50px] ml-8">0</p>
        <p className="flex-1 min-w-[50px] ml-7 mr-3">0</p>
      </div>
    </div>
  );
}
