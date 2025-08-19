export default function AddButton({ onAdd, label, className }) {
  return (
    <button
      onClick={onAdd}
      className={`ml-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
        className || ""
      }`}
      type="button"
    >
      {label}
    </button>
  );
}
