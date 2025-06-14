import React, { useState, useRef, useEffect } from "react";

function CheckboxDropdown({ title, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div
      className="relative inline-block w-52 font-sans text-white"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-2 text-left rounded-md border border-white bg-black focus:outline-none focus:ring-2 focus:ring-white"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg
          className="w-5 h-5 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute mt-1 w-full rounded-md bg-black border border-white shadow-lg max-h-60 overflow-auto z-[9999]"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center px-4 py-2 cursor-pointer"
              role="menuitem"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onClick={() => toggleOption(option)}
                readOnly
                className="form-checkbox h-5 w-5 text-white"
              />
              <span className="ml-3 text-sm">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default CheckboxDropdown;